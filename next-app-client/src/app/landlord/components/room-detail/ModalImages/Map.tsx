export default function Map() {
  const address = "90 Nguyễn Thức Tự Hòa Hải Ngũ Hành Sơn Đà Nẵng";
  const encodedAddress = encodeURIComponent(address);
  return (
    <div className="w-full h-full flex-1">
      <iframe
        src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0, width: "100%", height: "100%" }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
