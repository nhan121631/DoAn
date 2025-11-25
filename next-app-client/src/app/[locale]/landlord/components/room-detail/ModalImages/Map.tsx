interface Props {
  address: string;
}

export default function Map({ address }: Props) {
  const encodedAddress = encodeURIComponent(address);
  return (
    <div className="w-full h-full flex-1">
      <iframe
        src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
        title={`Map showing location for ${address}`}
        aria-label={`Map showing location for ${address}`}
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
