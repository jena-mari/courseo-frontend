import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { buildChatContext } from "../../lib/chatContext";
import { continueChat, startChat } from "../../lib/chatApi";
import { accountStorage, STORAGE_KEYS } from "../../lib/storageKeys";
import type { StudyPlanResponse } from "../../types/studyPlanType";
import type { ChatPhase } from "../../lib/chatProgress";
import type { Chat } from "../../components/layout/courseo-sidebar";
import type { ChatSession, Message } from "./types";
import { buildChatTitle, isProviderKeyError, loadInitialChats, parseAIResponse } from "./chatSession";
import { useChatAccess } from "./useChatAccess";
import { useComposer } from "./useComposer";
import { inferElectiveMode } from "../../components/account/ElectiveInterestsField";

export function useChat() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const storage = useMemo(() => accountStorage(user?.id), [user?.id]);
  const location = useLocation();
  const enrollment = storage.getItem(STORAGE_KEYS.enrolment) ?? "";
  const initialChats = useMemo(() => loadInitialChats(storage), [storage]);
  const initialActiveChat = initialChats[0];

  const [chats, setChats] = useState<ChatSession[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string>(
    initialActiveChat?.id ?? "new"
  );
  const [activeMessages, setActiveMessages] = useState<Message[]>(
    initialActiveChat?.messages ?? []
  );
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase>("sending");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [chatError, setChatError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studyPlanCollapsed, setStudyPlanCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileStudyPlanOpen, setMobileStudyPlanOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [studyPlanData, setStudyPlanData] = useState<StudyPlanResponse | null>(
    initialActiveChat?.studyPlanData ?? null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useComposer(inputText);
  const pendingPromptSentRef = useRef(false);

  const handbookHref = `https://courses.uow.edu.au/courses/${user?.commencementYear ?? new Date().getFullYear()}/${user?.degreeCode ?? "766"}`;

  const { availableModels, selectedModel, keyStatus, showKeyNotice, setShowKeyNotice,
    privacyAcknowledged, requireChatAccess, handleUnavailableKey, acknowledgePrivacy, changeModel
  } = useChatAccess(setChatError);

  useEffect(() => {
    if (activeChatId === "new") {
      setActiveMessages([]);
      setStudyPlanData(null);
    } else {
      const found = chats.find((c) => c.id === activeChatId);
      setActiveMessages(found?.messages ?? []);
      setStudyPlanData(found?.studyPlanData ?? null);
    }
  }, [activeChatId, chats]);

  useEffect(() => {
    if (location.pathname !== "/chat") return;
    storage.setItem(STORAGE_KEYS.chats, JSON.stringify(chats));
    storage.removeItem(STORAGE_KEYS.bootstrapChat);
  }, [chats, location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping || !requireChatAccess()) return;

      const activeChat = chats.find((chat) => chat.id === activeChatId);
      if (!activeChat?.backendSessionId) {
        setChatError(
          enrollment
            ? "Create a new chat before sending a message."
            : "Add your enrolment record before starting a study-planning chat."
        );
        return;
      }

      setChatError("");
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      const newMessages = [...activeMessages, userMsg];
      setActiveMessages(newMessages);
      setInputText("");
      setChatPhase("sending");
      setIsTyping(true);

      setChats((previousChats) =>
        previousChats.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                title: chat.title,
                messages: newMessages,
              }
            : chat
        )
      );

      try {
        const electiveInterests = user?.electiveInterests ?? [];
        const electiveMode = inferElectiveMode(electiveInterests);

        const data = await continueChat(activeChat.backendSessionId, trimmed, activeChat.model || selectedModel || undefined, setChatPhase, buildChatContext(user, storage.getItem(STORAGE_KEYS.enrolment) ?? "", electiveMode, electiveInterests));
        setChatPhase("formatting");
        const content = parseAIResponse(data.reply.content);

        if (content.studyPlanData) {
          setStudyPlanData(content.studyPlanData);
        }

        const aiMsg: Message = {
          id: String(data.reply.id),
          role: "assistant",
          content: content.cleanText,
          timestamp: new Date(data.reply.created_at),
        };

        const finalMessages = [...newMessages, aiMsg];
        setActiveMessages(finalMessages);

        setChats((previousChats) =>
          previousChats.map((chat) =>
            chat.id === activeChat.id
              ? {
                  ...chat,
                  title: chat.title,
                  messages: finalMessages,
                  studyPlanData:
                    content.studyPlanData ?? chat.studyPlanData,
                }
              : chat
          )
        );
      } catch (error) {
        if (isProviderKeyError(error)) {
          await handleUnavailableKey(error.message);
          return;
        }
        const errorText =
          error instanceof Error
            ? error.message
            : "Courseo could not complete that request.";
        setChatError(errorText);

        setInputText((current) => current || trimmed);
      } finally {
        setIsTyping(false);
      }
    },
    [activeMessages, activeChatId, chats, enrollment, handleUnavailableKey, isTyping, requireChatAccess, selectedModel, user, storage]
  );

  useEffect(() => {
    if (
      location.pathname !== "/chat" ||
      pendingPromptSentRef.current ||
      isTyping ||
      !privacyAcknowledged
    ) {
      return;
    }
    const pendingPrompt = storage.getItem(STORAGE_KEYS.pendingPrompt);
    if (!pendingPrompt) return;
    pendingPromptSentRef.current = true;
    storage.removeItem(STORAGE_KEYS.pendingPrompt);
    void sendMessage(pendingPrompt);
  }, [isTyping, location.pathname, privacyAcknowledged, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const activeChat = chats.find((chat) => chat.id === activeChatId);
      if (!activeChat?.backendSessionId) {
        startConversation(inputText);
      }
      else { sendMessage(inputText); }
    }
  };

  const startConversation = async (prompt : string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isTyping || !requireChatAccess()) return;

    setChatError("");
    setShowMenu(false);

    if (isCreatingChat) return;
    setIsCreatingChat(true);

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setActiveMessages([userMsg]);
    setInputText("");
    setChatPhase("sending");
    setIsTyping(true);

    try {

      const electiveInterests = user?.electiveInterests ?? [];
      const electiveMode = inferElectiveMode(electiveInterests);

      const result = await startChat(
        trimmed,
        selectedModel || undefined,
        setChatPhase,
        buildChatContext(
          user,
          storage.getItem(STORAGE_KEYS.enrolment) ?? "",
          electiveMode,
          electiveInterests
        )
      );      
      
      setChatPhase("formatting");
      const parsedReply = parseAIResponse(result.reply.content);

      const aiMsg: Message = {
          id: String(result.reply.id),
          role: "assistant",
          content: parsedReply.cleanText,
          timestamp: new Date(result.reply.created_at),
        };

      const chatMessages = [userMsg, aiMsg];

      const newChat: ChatSession = {
        id: result.session_id,
        backendSessionId: result.session_id,
        title: buildChatTitle({
          id: result.session_id,
          backendSessionId: result.session_id,
          title: "New chat",
          messages: chatMessages,
          studyPlanData: parsedReply.studyPlanData,
        }),
        messages: chatMessages,
        studyPlanData: parsedReply.studyPlanData,
        model: selectedModel || undefined,
      };

      setChats((existingChats) => [newChat, ...existingChats]);
      setActiveChatId(newChat.id);
      setActiveMessages(newChat.messages);
      setStudyPlanData(newChat.studyPlanData);
      setChatError("");

    } catch (error) {
      setInputText((current) => current || trimmed);
      if (isProviderKeyError(error)) {
        await handleUnavailableKey(error.message);
        return;
      }
      setChatError(
        error instanceof Error
          ? error.message
          : "Courseo could not create a new chat."
      );
    } finally {
      setIsCreatingChat(false);
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    if (isTyping || isCreatingChat || !requireChatAccess()) return;
    setShowMenu(false);
    setChatError("");
    setActiveChatId("new");
    setActiveMessages([]);
    setStudyPlanData(null);
    setInputText("");
  };

  const fillComposer = (prompt: string) => {
    setInputText(prompt);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submitComposer = () => {
    const activeChat = chats.find((chat) => chat.id === activeChatId);
    if (activeChat?.backendSessionId) void sendMessage(inputText);
    else void startConversation(inputText);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    const found = chats.find((c) => c.id === id);
    setActiveMessages(found?.messages ?? []);
    setStudyPlanData(found?.studyPlanData ?? null);
    setChatError("");
  };

  const handleDeleteChat = (id: string) => {
    const remainingChats = chats.filter((chat) => chat.id !== id);
    setChats(remainingChats);

    if (id === activeChatId) {
      const nextChat = remainingChats[0];
      setActiveChatId(nextChat?.id ?? "new");
      setActiveMessages(nextChat?.messages ?? []);
      setStudyPlanData(nextChat?.studyPlanData ?? null);
    }

    setChatError("");
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowMenu(false);
    try { await logout(); } finally { navigate("/"); setIsLoggingOut(false); }
  };

  const isEmptyChat = activeMessages.length === 0;

  const sidebarChats: Chat[] = chats.map((c) => ({
    id: c.id,
    title: c.title || buildChatTitle(c),
  }));

  return {
    navigate, user, enrollment, activeChatId,
    activeMessages, inputText, setInputText, isTyping,
    chatPhase, isCreatingChat, chatError, availableModels,
    selectedModel, keyStatus, showKeyNotice, setShowKeyNotice,
    privacyAcknowledged, acknowledgePrivacy, changeModel, sidebarCollapsed,
    setSidebarCollapsed, studyPlanCollapsed, setStudyPlanCollapsed, mobileSidebarOpen,
    setMobileSidebarOpen, mobileStudyPlanOpen, setMobileStudyPlanOpen, showAccount,
    setShowAccount, showMenu, setShowMenu, showHelp,
    setShowHelp, isLoggingOut, studyPlanData, messagesEndRef,
    inputRef, handbookHref, handleKeyDown, handleNewChat,
    fillComposer, submitComposer, handleSelectChat, handleDeleteChat,
    handleLogout, isEmptyChat, sidebarChats,
  };
}

export type ChatController = ReturnType<typeof useChat>;
