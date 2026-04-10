"use client";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="text-sm text-gray-500 text-center md:text-left">
        Copyright &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://vetencode.com"
          target="_blank"
          className="text-gray-700 hover:text-blue-600 transition"
        >
          VETENCODE.COM
        </a>{" "}
        All rights reserved.
      </div>
    </footer>
  );
}