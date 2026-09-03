const avatars = Array.from(
  { length: 6 },
  (_, i) => `/avatars/IMG${i.toString().padStart(2, '0')}.jpg`
)

export default function AvatarCloud() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          gap-10
          place-items-center
        "
      >
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Community member"
            className="
              h-28 w-28
              sm:h-36 sm:w-36
              md:h-40 md:w-40
              rounded-full
              object-cover
              border-2 border-green-400
              shadow-lg
              bg-white
            "
          />
        ))}
      </div>
    </div>
  )
}
