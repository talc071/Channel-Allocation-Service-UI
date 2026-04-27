/**
 * Visual shell for an action panel. Pulled out so all three panels look
 * consistent without each repeating the same Tailwind classes.
 */
export default function PanelCard({ title, description, children }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
