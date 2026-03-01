interface Column<T> {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
}

export default function Table<T extends Record<string, unknown>>({
    columns,
    data,
    emptyMessage = "No data available",
}: TableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.map((row, idx) => (
                        <tr
                            key={idx}
                            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                                >
                                    {col.render
                                        ? col.render(row)
                                        : (row[col.key] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
