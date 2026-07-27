import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, ArrowRight, MoreVertical, Sparkles,
  BookOpen, X, User, Mail, Lock, Eye, EyeOff, HelpCircle
} from "lucide-react";
import { getAuthSession, updateAuthSessionUser } from "../lib/authSession";

interface UserData {
  username: string;
  email: string;
}

export function AccountManagement({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);

  const handleAccountChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) return setError("Please enter a new username.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError("Please enter a new valid email address.");
    }
    // if (password.length < 6) return setError("Password must be at least 6 characters.");
    // if (password !== confirmPassword) return setError("Passwords do not match.");
    // if (!agreePrivacy) return setError("Please agree to the Privacy Policy.");

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    updateAuthSessionUser({
      ...(getAuthSession()?.user ?? { username }),
      username: username.trim(),
      email: email.trim(),
    });
    setError("Account updated.");
    await new Promise((r) => setTimeout(r, 2000));
    onClose();
  };

  const [user, setData] = useState<UserData | null>(null);

  useEffect(() => {
    const sessionUser = getAuthSession()?.user;
    if (sessionUser) {
      setData({
        username: sessionUser.username,
        email: sessionUser.email ?? "",
      });
    }
  }, []);

  useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  }, [user]);  


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="bg-white rounded-[40px] shadow-xl w-full max-w-2xl p-8 relative max-h-[80vh] overflow-y-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#000181] transition-colors"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[rgba(131,231,255,0.5)] rounded-xl flex items-center justify-center">
            <User size={20} className="text-[#000181]" />
          </div>
          <h2 className="font-extrabold text-2xl text-[#000181] tracking-tight">
            Your Account
          </h2>
        </div>

        {/* {user && (
          <> */}
          <div className="space-y-4 text-[14px] text-[#000181]">
            <div className="bg-[rgba(131,231,255,0.2)] rounded-2xl p-4">
              <p className="font-bold mb-1">Change your account information here</p>
            </div>
            
            <form className="space-y-3 px-1 sm:px-2" onSubmit={handleAccountChange}>
              <div>
                <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
                  Username
                </label>
                <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
                  <User size={16} className="text-[rgba(0,1,129,1)] shrink-0" />
                  <input
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,1)] placeholder:text-[rgba(0,1,129,1)] outline-none bg-transparent min-w-0"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
                  Email
                </label>
                <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
                  <Mail size={16} className="text-[rgba(0,1,129,1)] shrink-0" />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,1)] placeholder:text-[rgba(0,1,129,1)] outline-none bg-transparent min-w-0"
                  />
                </div>
              </div>

              <div className='flex items-baseline-last gap-4'>
                <div className='self-stretch w-[62%]'>
                  <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
                    Password
                  </label>
                  
                  <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
                    <Lock size={16} className="text-[rgba(0,1,129,1)] shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,1)] placeholder:text-[rgba(0,1,129,1)] outline-none bg-transparent min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => {setShowPassword(!showPassword)}}
                      className="text-[rgba(0,1,129,0.5)] hover:text-[#000181] transition-colors shrink-0"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUpdatePassword(!updatePassword)}
                  className="px-8 bg-[rgba(0,1,129,0.7)] border-2 border-[#000181] rounded-[20px] h-11 font-bold text-[14px] text-white"
                  >
                    Change Password
                  </motion.button>
                </div>

                
              </div>

              {updatePassword && (
                <>
                <div className='bg-[rgba(232,160,255,0.5)] py-5 p-5 rounded-3xl'>
                  <div className='flex items-baseline-last gap-4'>
                    <div className='self-stretch w-[62%]'>
                      <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
                        New Password
                      </label>
                      
                      <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
                        <Lock size={16} className="text-[rgba(0,1,129,1)] shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,1)] placeholder:text-[rgba(0,1,129,1)] outline-none bg-transparent min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => {setShowPassword(!showPassword)}}
                          className="text-[rgba(0,1,129,0.5)] hover:text-[#000181] transition-colors shrink-0"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className='self-stretch w-[62%]'>
                      <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
                        Confirm New Password
                      </label>
                      
                      <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
                        <Lock size={16} className="text-[rgba(0,1,129,1)] shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,1)] placeholder:text-[rgba(0,1,129,1)] outline-none bg-transparent min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => {setShowPassword(!showPassword)}}
                          className="text-[rgba(0,1,129,0.5)] hover:text-[#000181] transition-colors shrink-0"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>                   

                  </div>

                  <div className='pt-5 flex justify-end'>
                  <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUpdatePassword(!updatePassword)}
                  className="px-8 bg-[rgba(0,1,129,0.7)] border-2 border-[#000181] rounded-[20px] h-11 font-bold text-[14px] text-white"
                  >
                    
                    Save Password
                  </motion.button>
                </div>      

                </div>          
                </>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm font-semibold text-center"
                >
                  {error}
                </motion.p>
              )}

              <div className='flex justify-end items-center gap-6 pr-3'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  // onClick={onClose}
                  className="mt-5 px-10 bg-[rgba(131,231,255,0.5)] border-2 border-[#000181] rounded-[20px] h-11 font-bold text-[14px] text-[#000181]"
                >
                  Save changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="mt-5 px-8 bg-[rgba(232,160,255,0.5)] border-2 border-[#000181] rounded-[20px] h-11 font-bold text-[14px] text-[#000181]"
                >
                  Cancel
                </motion.button>
              </div>

            </form>
          </div>

          
        {/* </>
        )} */}



      </motion.div>
    </motion.div>
  );
}
