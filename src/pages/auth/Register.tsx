import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type Role = "consumer" | "store" | "delivery";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export  const Register=()=> {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "consumer",
  });


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await fetch("https://rappibackend.vercel.app/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    });

    // guardar rol localmente
    localStorage.setItem("role", form.role);

    navigate("/login");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value as Role,
            })
          }
        >
          <option value="consumer">Consumer</option>
          <option value="store">Store</option>
          <option value="delivery">Delivery</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}