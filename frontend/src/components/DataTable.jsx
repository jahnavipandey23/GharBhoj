// Simple table used by every admin page. head = ['A','B'], rows = [[cellA, cellB], ...]
export default function DataTable({ head, rows }) {
  return (
    <div className="card tbl">
      <table>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={head.length} className="note">Nothing here yet.</td></tr>}
          {rows.map((cells, i) => <tr key={i}>{cells.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
