export interface ColumnsData {
  accessorKey: string;
  columnDefType: string;
  header: string;
  id: string;
  size: number;
}
export interface RowSelectionInterface {
  [key: number]: boolean;
}

export interface DataGraph {
  duty_id: number;
  group: number;
  id: number;
  start_time: any;
  end_time: any;
  itemProps: any;
}