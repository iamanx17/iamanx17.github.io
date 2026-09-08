import { Block, Cell, Tone } from "@/lib/tools/types";

const TONE: Record<Tone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  error: "text-err",
};

function CellText({ cell }: { cell: Cell }) {
  if (typeof cell === "string") return <span className="whitespace-pre-wrap">{cell}</span>;

  const className = cell.tone ? TONE[cell.tone] : cell.muted ? "text-faint" : "";

  return <span className={`whitespace-pre-wrap ${className}`}>{cell.text}</span>;
}

function One({ block }: { block: Block }) {
  if (block.kind === "heading") {
    return (
      <h3 className={`mt-4 mb-2 font-semibold first:mt-0 ${block.tone ? TONE[block.tone] : ""}`}>
        {block.text}
      </h3>
    );
  }

  if (block.kind === "text") {
    return <p className={`mb-2 ${block.muted ? "text-faint" : "text-dim"}`}>{block.text}</p>;
  }

  if (block.kind === "code") {
    return (
      <pre className="mb-2 overflow-x-auto rounded-lg border border-line bg-bg p-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
        {block.text}
      </pre>
    );
  }

  if (block.kind === "list") {
    return (
      <ul className="mb-2 list-disc space-y-1 pl-5 text-dim">
        {block.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mb-2 overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse font-mono text-xs">
        {block.head && (
          <thead>
            <tr>
              {block.head.map((cell) => (
                <th
                  key={cell}
                  className="border-b border-line bg-panel-2 px-3 py-2 text-left font-semibold whitespace-nowrap"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row, index) => (
            <tr key={index} className="border-b border-line-soft last:border-0">
              {row.map((cell, column) => (
                <td key={column} className="px-3 py-2 align-top">
                  <CellText cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Output({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-sm">
      {blocks.map((block, index) => (
        <One key={index} block={block} />
      ))}
    </div>
  );
}
