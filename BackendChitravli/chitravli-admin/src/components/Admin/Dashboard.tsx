import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

export default function Dashboard({ initPageResult }: AdminViewServerProps) {
  const user = initPageResult.req.user

  if (!user) {
    return <div>You must be logged in to view this page.</div>
  }

  return (
    <Gutter>
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ marginBottom: '24px' }}>Welcome, {user.email}</p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <Link href="/admin/collections/pages" style={cardStyle}>
            Manage Pages
          </Link>

          <Link href="/admin/collections/categories" style={cardStyle}>
            Manage Categories
          </Link>

          <Link href="/admin/collections/media" style={cardStyle}>
            Manage Media
          </Link>

          <Link href="/admin/globals/header" style={cardStyle}>
            Header Settings
          </Link>

          <Link href="/admin/globals/footer" style={cardStyle}>
            Footer Settings
          </Link>

          <Link href="/admin/account" style={cardStyle}>
            My Account
          </Link>
        </div>
      </div>
    </Gutter>
  )
}

const cardStyle: React.CSSProperties = {
  display: 'block',
  padding: '18px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  textDecoration: 'none',
  color: 'inherit',
  background: '#fff',
}