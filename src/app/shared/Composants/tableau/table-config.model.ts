// generic-table-config.model.ts
export interface TableColumn {
    field: string;
    header: string;
    type?: 'text' | 'number' | 'date' | 'boolean';
    editable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
  }
  
  export interface TableConfig {
    columns: TableColumn[];
    pageSize: number;
    modalTitle: string;
    addLabel: string;
    editLabel: string;
    deleteLabel: string;
  }
  