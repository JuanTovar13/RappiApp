import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export type Role = "consumer" | "store" | "delivery";

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://rappibackend.vercel.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      const token = data.session?.access_token;
      const role: Role = data.user.role;

      if (!token) {
        console.error("No token received");
        return;
      }



      localStorage.setItem("token", token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("name", data.user.name);
      
console.log("ROLE:", data.user.role, "USER:", data.user, "NAME:", data.user.name);
      
    

      if (role === "consumer") {
        navigate("/consumer");
      } else if (role === "store") {
        navigate("/store");
      } else if (role === "delivery") {
        navigate("/delivery");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>

      <h1>Login</h1>
    <button onClick={()=> navigate("/")}>Go to Register</button>
    

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};