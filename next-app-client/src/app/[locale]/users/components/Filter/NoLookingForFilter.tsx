"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Link from "next/link";

export default function NoLookingForFilter() {
  return (
    <div className="flex flex-col items-center w-full py-16">
      <DotLottieReact
        src="https://lottie.host/ff0c7db9-e46e-4053-bc4b-9684dc6aba59/FPEN6Mu8bi.lottie"
        // background="transparent"
        speed={1}
        style={{ width: 300, height: 300 }}
        loop
        autoplay
      />
      <h2 className="mt-4 text-2xl font-bold text-gray-700">No rooms found</h2>
      <p className="mt-2 text-gray-500 text-center max-w-xs">
        Sorry, we couldn&#39;t find any rooms matching your search. Try
        adjusting your filters or search again.
      </p>
      {/* <Link
        href="/users"
        className="mt-6 px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        See all post
      </Link> */}
    </div>
  );
}
