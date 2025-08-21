'use client';

import * as React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import Link from 'next/link';
import DataTable from '@/components/data-display/table/DataTable';
import { useTranslation } from '@/hooks/useTranslation';
import NextAvatar from '../ui/NextAvatar';

interface User {
  id: number;
  username: string;
  role: string;
  fullName: string;
  userImgUrl: string | null;
}

// Row used by DataGrid (must include `id`)
interface FlattenedUserRow {
  id: number;
  fullName: string;
  userImgUrl: string | null;
  username: string;
  role: string;
}

/** Map incoming users to flat rows for the grid */
const flattenUsers = (users: User[]): FlattenedUserRow[] =>
  users.map((u) => ({
    id: u.id,                       // ✅ real id
    fullName: u.fullName,
    userImgUrl: u.userImgUrl,
    username: u.username,           // ✅ correct field name
    role: u.role,
  }));

type UserTableProps = {
  users: User[];
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

const roleColor = (role: string) => {
  const r = role.toLowerCase();
  if (['admin', 'owner', 'superadmin'].includes(r)) return { color: 'error', variant: 'outlined' } as const;
  if (['manager', 'lead'].includes(r)) return { color: 'warning', variant: 'outlined' } as const;
  if (['staff', 'user', 'member'].includes(r)) return { color: 'success', variant: 'outlined' } as const;
  return { color: 'default', variant: 'outlined' } as const;
};

const UserTable: React.FC<UserTableProps> = ({ users, isLoading, error }) => {
  const { t } = useTranslation();

  /*
  const handleEdit = React.useCallback(
    (id: number) => {
      router.push(`/users/edit/${id}`);
    },
    [router]
  );
  */

  const columns: GridColDef<FlattenedUserRow>[] = React.useMemo(
    () => [
      {
        field: 'userImgUrl',
        headerName: t('lbl_propics'),
        width: 160,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<FlattenedUserRow, string | null>) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <NextAvatar url={params.value ?? ''} />
          </Box>
        ),
      },
      {
        field: 'fullName',
        headerName: t('lbl_fullName') ?? 'Full Name',
        flex: 1,
        minWidth: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Link
            href={`/users`}  // ✅ use id
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {params.row.fullName}
          </Link>
        ),
      },
      {
        field: 'username',
        headerName: t('lbl_username') ?? 'Username',
        width: 200,
        align: 'left',
        headerAlign: 'center',
        renderCell: (params) => (
          <span className="text-slate-600">{params.row.username}</span>
        ),
      },
      {
        field: 'role',
        headerName: t('lbl_role') ?? 'Role',
        width: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const { color, variant } = roleColor(params.row.role);
          return <Chip label={params.row.role} size="small" color={color} variant={variant} />;
        },
      }
    ],
    [t]
  );

  return (
    <DataTable
      className="sm:w-[calc(100vw-225px)] w-[calc(100vw-25px)]"
      data={users}
      dataMapper={flattenUsers}
      columns={columns}
      isLoading={isLoading}
      error={error}
      filterField="fullName"
      searchTextLabel={t('search_users_placeholder') ?? 'Search by name...'}
      rowHeight={72}
    >
    </DataTable>
  );
};

export default UserTable;
