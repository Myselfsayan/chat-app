import React  from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext.js";
import { useState } from "react";
import { useContext } from "react";




function LoginPage() {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] =useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  

  //const navigate = useNavigate();


  

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    login((currState==='Sign up'?'register':'login'), { fullName, email, password, bio });
};
  return (
  <div className="min-h-screen bg-brand-bg flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col">
  
  {/* -------- left -------- */}
  <div className="flex flex-col items-center gap-3 max-sm:hidden">
    <img
      src={assets.convolink_logo}
      alt="ConvoLink"
      className="w-[min(28vw,220px)] drop-shadow-[0_0_24px_rgba(91,157,255,0.5)]"
    />
    <p className="text-2xl font-bold tracking-wide text-brand-text">ConvoLink</p>
    <p className="text-brand-muted text-sm">Chat anytime, anywhere</p>
  </div>

  {/* -------- right -------- */}
    <form onSubmit={onSubmitHandler} className="border border-brand-border bg-brand-surface text-brand-text p-6 flex flex-col gap-6 rounded-xl shadow-2xl glow-primary-sm">
    
      <h2 className="font-semibold text-2xl flex justify-between items-center text-brand-text">
        {currState}
        {
          isDataSubmitted && <img
          onClick={()=>{setIsDataSubmitted(false)}}
          src={assets.arrow_icon}
          alt=""
          className="w-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
          />
        }
        
      </h2>

      {currState === "Sign up" && !isDataSubmitted && (
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          type="text"
          placeholder="Full Name"
          required
          className="p-2.5 bg-brand-sidebar border border-brand-border rounded-lg text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:shadow-[0_0_0_2px_rgba(124,92,255,0.15)] transition-all duration-200"
        />
      )}
      
      {!isDataSubmitted && (
      <>
        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2.5 bg-brand-sidebar border border-brand-border rounded-lg text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:shadow-[0_0_0_2px_rgba(124,92,255,0.15)] transition-all duration-200"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2.5 bg-brand-sidebar border border-brand-border rounded-lg text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:shadow-[0_0_0_2px_rgba(124,92,255,0.15)] transition-all duration-200"
        />
      </>
      )}

      {currState === "Sign up" && isDataSubmitted && (
        <textarea
          rows={4}
          placeholder="Provide a short bio..."
          required
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="p-2.5 bg-brand-sidebar border border-brand-border rounded-lg text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:shadow-[0_0_0_2px_rgba(124,92,255,0.15)] transition-all duration-200 resize-none"
        />
      )}
      

      <button
        type="submit"
        className="py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg cursor-pointer font-medium hover:opacity-90 hover:glow-btn glow-btn transition-all duration-200"
      >
        {currState === "Sign up" ? "Create Account" : "Login Now"}
      </button>

      <div className="flex items-center gap-2 text-sm text-brand-muted">
        <input type="checkbox" className="accent-brand-primary" />
        <p>Agree to the terms of use &amp; privacy policy.</p>
      </div>

      <div className="flex flex-col gap-2">
        {currState === "Sign up" ? (
          <p className="text-sm text-brand-muted">
            Already have an account?{" "}
            <span 
            onClick={() => {
              setCurrState("Login");
              setIsDataSubmitted(false);
              
            }}
            className="font-semibold text-brand-primary cursor-pointer hover:text-brand-secondary transition-colors duration-200">
              Login here
            </span>
          </p>
        ) : (
          <p className="text-sm text-brand-muted">
            Create an account{" "}
            <span 
            onClick={() => {
              setCurrState("Sign up");
              setIsDataSubmitted(false);
            }}
            className="font-semibold text-brand-primary cursor-pointer hover:text-brand-secondary transition-colors duration-200">
              Click here
            </span>
          </p>
        )}
      </div>
  </form>
</div>
)}

export default LoginPage;
