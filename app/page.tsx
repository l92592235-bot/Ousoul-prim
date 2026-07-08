export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ color: '#d4af6a', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.04em' }}>
        أصول برايم
      </h1>
      <p style={{ color: '#8a8f9c', maxWidth: 420, lineHeight: 1.8 }}>
        هذه المنصة خاصة وتُستخدم عبر روابط دعوة حصرية فقط. إذا وصلك رابط خاص، يرجى فتحه مباشرة.
      </p>
      <p style={{ position: 'fixed', bottom: 12, opacity: 0.15, fontSize: '0.7rem', color: '#8a8f9c' }}>
        ملكية خاصة
      </p>
    </main>
  );
}
