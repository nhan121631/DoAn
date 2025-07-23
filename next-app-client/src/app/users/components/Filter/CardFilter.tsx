export default function CardFilter() {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-4 w-[300px]">
      <div>
        <h3 className="font-semibold text-[15px] mb-2 text-gray-800">
          Price Range
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> Under 1M
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 1-2M
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 2-3M
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 3-5M
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 5-7M
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 7-10M
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 10-15M
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> Above 15M
          </a>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-[15px] mb-2 text-gray-800">Area</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> Under 20m<sup>2</sup>
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 20-30m<sup>2</sup>
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 30-50m<sup>2</sup>
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 50-70m<sup>2</sup>
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> 70-90m<sup>2</sup>
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sky-700 hover:text-orange-500 text-[14px]"
          >
            <span className="text-orange-500">&gt;</span> Above 90m<sup>2</sup>
          </a>
        </div>
      </div>
    </div>
  );
}
