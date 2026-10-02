import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatConversation } from "../components/chat/ChatConversation";
import { ChatHeader } from "../components/chat/ChatHeader";
import { motion, AnimatePresence } from "framer-motion";
import imgBg from "../assets/courseo-bg.png";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { CourseoSidebar } from "../components/layout/courseo-sidebar";
import { StudyPlan } from "../components/study-plan/StudyPlan";
import { HelpSlider } from "../components/help/help-carousel";
import { AccountManagement } from "../components/account/AccountManagementPopup";
import { LlmPrivacyDisclosure } from "../components/account/LlmPrivacyDisclosure";
import { ApiKeyStatusNotice } from "../components/account/ApiKeyStatusNotice";
import { useChat } from "../features/chat/useChat";


export function ChatPage() {
  const {
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
  } = useChat();

  if (isLoggingOut) {
    return <LoadingScreen title="Signing out" detail="Ending your secure session with Courseo…" />;
  }


  return (
    <div
      className="relative w-full min-h-[100dvh] overflow-x-clip font-['Montserrat',sans-serif]"
    >
      <img
        src={imgBg}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative z-10 courseo-workspace flex items-stretch">
        <div className="hidden lg:block h-full">
          <CourseoSidebar
          chats={sidebarChats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          onAccount={() => setShowAccount(true)}
          onHelp={() => setShowHelp(true)}
          onSettings={() => navigate("/settings")}
          onApiKeys={() => navigate("/settings?tab=system#api-keys")}
          />
        </div>

        <main className="flex-1 bg-white rounded-[22px] sm:rounded-[26px] xl:rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden min-w-0">
          <ChatHeader
            navigate={navigate}
            setMobileSidebarOpen={setMobileSidebarOpen}
            availableModels={availableModels}
            selectedModel={selectedModel}
            changeModel={changeModel}
            setMobileStudyPlanOpen={setMobileStudyPlanOpen}
            setShowMenu={setShowMenu}
            showMenu={showMenu}
            isCreatingChat={isCreatingChat}
            handleNewChat={handleNewChat}
            handbookHref={handbookHref}
            enrollment={enrollment}
            handleLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          {/* <Slider onClose={() => setShowHelp(false)}></Slider> */}

          <ChatConversation
            isEmptyChat={isEmptyChat}
            isCreatingChat={isCreatingChat}
            chatPhase={chatPhase}
            enrollment={enrollment}
            activeMessages={activeMessages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            setShowHelp={setShowHelp}
            fillComposer={fillComposer}
          />

          <ChatComposer
            keyStatus={keyStatus}
            chatError={chatError}
            studyPlanData={studyPlanData}
            inputRef={inputRef}
            inputText={inputText}
            setInputText={setInputText}
            handleKeyDown={handleKeyDown}
            submitComposer={submitComposer}
            isTyping={isTyping}
          />

        </main>

        <div className="hidden xl:block h-full">
          <StudyPlan
            collapsed={studyPlanCollapsed}
            onToggle={() => setStudyPlanCollapsed((v) => !v)}
            studyPlanInput={studyPlanData}
          />
        </div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050515]/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="h-full p-2.5"
              onClick={(event) => event.stopPropagation()}
            >
              <CourseoSidebar
                chats={sidebarChats}
                activeChatId={activeChatId}
                onNewChat={() => {
                  setMobileSidebarOpen(false);
                  void handleNewChat();
                }}
                onSelectChat={(id) => {
                  handleSelectChat(id);
                  setMobileSidebarOpen(false);
                }}
                onDeleteChat={handleDeleteChat}
                onToggle={() => setMobileSidebarOpen(false)}
                expandedWidth="min(86vw, 320px)"
                onAccount={() => {
                  setMobileSidebarOpen(false);
                  setShowAccount(true);
                }}
                onHelp={() => {
                  setMobileSidebarOpen(false);
                  setShowHelp(true);
                }}
                onSettings={() => navigate("/settings")}
                onApiKeys={() => navigate("/settings?tab=system#api-keys")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileStudyPlanOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex justify-end bg-[#050515]/45 backdrop-blur-[2px] xl:hidden"
            onClick={() => setMobileStudyPlanOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="h-full p-2.5"
              onClick={(event) => event.stopPropagation()}
            >
              <StudyPlan
                onToggle={() => setMobileStudyPlanOpen(false)}
                expandedWidth="min(92vw, 360px)"
                studyPlanInput={studyPlanData}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccount && (
          <AccountManagement onClose={() => setShowAccount(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelp && (
          <HelpSlider onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {user && !privacyAcknowledged && keyStatus === "ready" && (
          <LlmPrivacyDisclosure onAcknowledge={acknowledgePrivacy} onLeave={() => navigate("/")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showKeyNotice && (
          <ApiKeyStatusNotice
            message="Your saved key could not be verified or may have reached its limit. Update or re-check it before sending another message."
            onAction={() => navigate("/settings?tab=system#api-keys")}
            onDismiss={() => setShowKeyNotice(false)}
          />
        )}
      </AnimatePresence>

      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
