import { usePhoto } from "../lib/use-photo";

interface AvatarProps {
  name: string;
  photoKey?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, photoKey, size = 56, className }: AvatarProps) {
  const url = usePhoto(photoKey);
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "·";

  return (
    <div
      className={`avatar ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {url ? (
        <img src={url} alt="" />
      ) : (
        <span className="avatar-initial" style={{ fontSize: size * 0.42 }}>
          {initial}
        </span>
      )}
    </div>
  );
}
