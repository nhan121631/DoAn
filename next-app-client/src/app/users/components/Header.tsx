import Image from "next/image";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";
export default function Header() {
  return (
    <header className="h-[80px] absolute top-0 left-0 w-full flex items-center justify-between px-8 shadow-md z-5">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/logo-ant.png"
          alt="JustHome"
          width={100}
          height={40}
          priority
        />
      </div>
      {/* Navigation */}
      <nav>
        <ul className="flex gap-8 text-lg">
          <li>
            <Link
              href="/home"
              className="hover:text-yellow-400 transition text-white"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/users/settings"
              className="hover:text-yellow-400 transition text-white"
            >
              Rental rooms
            </Link>
          </li>
          <li>
            <Link
              href="/users/profile"
              className="hover:text-yellow-400 transition text-white"
            >
              Landlords
            </Link>
          </li>
          <li>
            <Link
              href="/users/notifications"
              className="hover:text-yellow-400 transition text-white"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      {/* Hotline & Add Property */}
      <div className="flex items-center gap-6">
        <button className=" text-white px-4 py-2 rounded-full font-semibold shadow flex items-center gap-2">
          <AiOutlineUserAdd />
          Register
        </button>
        <button className=" text-white px-4 py-2 rounded-full font-semibold shadow flex items-center gap-2">
          <IoLogInOutline />
          Login
        </button>
        <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full font-semibold shadow flex items-center gap-2">
          <FaRegEdit />
          Create Post
        </button>
      </div>
    </header>
  );
}
