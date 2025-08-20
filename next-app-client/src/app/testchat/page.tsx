// "use client";
// import React, { useState, useEffect } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   addDoc,
//   serverTimestamp,
//   query,
//   orderBy,
//   onSnapshot,
// } from "firebase/firestore";

// interface Message {
//   id: string;
//   text: string;
//   createdAt: any;
//   user: string;
// }

// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [user] = useState("User" + Math.floor(Math.random() * 1000));

//   useEffect(() => {
//     const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       setMessages(
//         snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...(doc.data() as Omit<Message, "id">),
//         }))
//       );
//     });
//     return () => unsubscribe();
//   }, []);

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim()) return;
//     await addDoc(collection(db, "messages"), {
//       text: input,
//       createdAt: serverTimestamp(),
//       user,
//     });
//     setInput("");
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "0 auto" }}>
//       <div
//         style={{
//           height: 400,
//           overflowY: "auto",
//           border: "1px solid #eee",
//           padding: 8,
//         }}
//       >
//         {messages.map((msg) => (
//           <div key={msg.id} style={{ margin: "8px 0" }}>
//             <b>{msg.user}:</b> {msg.text}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={sendMessage} style={{ display: "flex", marginTop: 8 }}>
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           style={{ flex: 1, marginRight: 8 }}
//           placeholder="Nhập tin nhắn..."
//         />
//         <button type="submit">Gửi</button>
//       </form>
//     </div>
//   );
// }
