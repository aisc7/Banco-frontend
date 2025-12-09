import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export interface AppTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface AppTableProps<T> {
  columns: AppTableColumn<T>[];
  data: T[];
  /**
   * Función opcional para obtener un identificador estable por fila.
   * Por defecto intenta usar `row.id` y si no existe, el índice.
   */
  getRowId?: (row: T, index: number) => React.Key;
}

interface AppTableRowProps {
  row: any;
  columns: AppTableColumn<any>[];
}

// Fila de tabla memoizada para reducir renders innecesarios en listas grandes.
const AppTableRow = React.memo<AppTableRowProps>(({ row, columns }) => {
  return (
    <TableRow>
      {columns.map((col) => (
        <TableCell key={String(col.key)}>
          {col.render ? col.render(row) : (row as any)[col.key as any]}
        </TableCell>
      ))}
    </TableRow>
  );
});

export function AppTable<T>({ columns, data, getRowId }: AppTableProps<T>) {
  const cols = columns as AppTableColumn<any>[];

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={String(col.key)}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => {
            const fallbackId = (row as any)?.id ?? idx;
            const key = getRowId ? getRowId(row, idx) : fallbackId;
            return <AppTableRow key={key} row={row} columns={cols} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

