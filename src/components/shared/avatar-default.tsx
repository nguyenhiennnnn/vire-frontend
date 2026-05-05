interface AvatarDefaultProps {
  size?: "small" | "full";
}

export const AvatarDefault = ({ size = "full" }: AvatarDefaultProps) => {
  const sizeClass = size === "small" ? "w-8 h-8" : "w-full h-full";

  return (
    <img
      src="/assets/vire-avatar-default.svg"
      className={`${sizeClass} object-cover`}
      alt="avatar"
    />
  );
};
