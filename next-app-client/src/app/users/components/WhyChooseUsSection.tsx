import Image from "next/image";

export default function WhyChooseUsSection() {
  return (
    <div className="flex flex-col items-center w-full px-4 py-24 mt-10 bg-gray-50">
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <h2 className="mb-6 text-3xl font-bold text-center">Why Choose Us</h2>
        <span className="leading-relaxed text-center text-gray-600">
          We provide verified listings, trusted landlords, and seamless rental
          experiences. Find your perfect room with our advanced search filters,
          virtual tours, and 24/7 customer support. Safe, fast, and reliable -
          your home is just a click away.
        </span>
      </div>
      <div className="flex flex-col flex-wrap items-center justify-center gap-8 py-1 mt-10 md:flex-row md:gap-4">
        <div className="flex flex-col items-center w-full md:w-[280px] lg:w-[220px] xl:w-[280px] gap-2">
          <Image src="/Icon.svg" width={48} height={48} alt="Find Room" />
          <strong className="mt-2 text-sm text-center text-gray-600">
            Find your dream room with us
          </strong>
          <span className="px-4 text-center text-gray-600 md:px-2">
            We help you find a room by offering a smart real estate experience
          </span>
        </div>

        <div className="flex flex-col items-center w-full md:w-[280px] lg:w-[220px] xl:w-[280px] gap-2">
          <Image src="/Agent.svg" width={48} height={48} alt="Agents" />
          <strong className="mt-2 text-sm text-center text-gray-600">
            Experienced agents
          </strong>
          <span className="px-4 text-center text-gray-600 md:px-2">
            Find an experienced agent who knows your market best
          </span>
        </div>

        <div className="flex flex-col items-center w-full md:w-[280px] lg:w-[220px] xl:w-[280px] gap-2">
          <Image src="/Rentroom.svg" width={48} height={48} alt="Rent room" />
          <strong className="mt-2 text-sm text-center text-gray-600">
            Rent rooms
          </strong>
          <span className="px-4 text-center text-gray-600 md:px-2">
            Millions of rooms in your favourite cities
          </span>
        </div>

        <div className="flex flex-col items-center w-full md:w-[280px] lg:w-[220px] xl:w-[280px] gap-2">
          <Image src="/Ownroom.svg" width={48} height={48} alt="Find Room" />
          <strong className="mt-2 text-sm text-center text-gray-600">
            List your own room
          </strong>
          <span className="px-4 text-center text-gray-600 md:px-2">
            Sign up now and sell or rent your own rooms
          </span>
        </div>
      </div>
    </div>
  );
}
