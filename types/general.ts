import { ColumnDef, PaginationState } from "@tanstack/react-table";

export type FetchPostParams<TParams> = {
    url: string
    body: TParams
    headers?: {[key: string]: string}
}

export type UserType = {
    id: string
    username: string
    password: string
    role: string
    is_active: boolean
    created_at: string
}

export interface ServerTableProps<T> {
    columns: ColumnDef<T, any>[];
    data: T[];
    pageCount: number;
    total: number;
    isLoading?: boolean;
    pagination: PaginationState;
    onPageChange?: (pageIndex: number) => void;
    onPaginationChange: ({ pageIndex, pageSize }: PaginationState) => void;
    onSortChange?: (sort: { key: string; desc: boolean }) => void;
    onSearch?: (search: string) => void;
}

export type Personel = {
    id: string;
    nama: string;
    nrp: string;
    pangkat: string;
    jabatan: string;
    pendidikan: Pendidikan[];
    umum?: Pendidikan[];
    kepolisian?: Pendidikan[];
    kejuruan?: Pendidikan[];
    is_detective: boolean;
    skep: string;
    certified: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
};

export type Pendidikan = {
    id: string;
    jenis: string;
    nama_sekolah: string;
    personel: Personel;
    personel_id: string;
    tahun_mulai: number;
    created_at: string
}

export type Penanganan = {
    id: string;
    jenis: string;
    nomor: string;
    judul: string;
    tanggal: Date;
    kronologis: string;
    pasal: string[];
    pelapor: string[];
    terlapor: string[];
    saksi: string[];
    status_proses: string;
    catatan_hambatan: string;
    rtl: string;
    keterangan: string;
    created_at: string
}

export type ResponseTypes = {
    code: number;
    content: any,
    message: string;
}

export type ResponseTableTypes = {
    code: number;
    content: {
        count: number;
        results: object[]
    },
    message: string;
}

export type AbsensiType = {
    id: string;
    created_at: Date;
    personel_id: string;
    personel: Personel;
    tanggal: string;
    jam_datang: Date;
    jam_pulang: Date;
    status: string | null;
    qr_code: string | null;
};

export type TableHeader = {
    content: string;
    styles?: {
      fillColor?: string | number[];
      textColor?: string | number[];
      fontStyle?: string;
      halign?: string;
      valign?: string;
    };
    colSpan?: number
    rowSpan?: number
  }