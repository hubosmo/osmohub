export function RichOrPlain({ text, className = "", color }: { text: string; className?: string; color?: string }) {
  const isHtml = text.trimStart().startsWith("<");
  if (isHtml) {
    return (
      <div
        className={`rich-content ${className}`}
        style={color ? { color } : undefined}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i} className="leading-[1.85]" style={color ? { color } : undefined}>
          {para.trim()}
        </p>
      ))}
    </div>
  );
}
