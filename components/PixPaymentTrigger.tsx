'use client'

import { useState } from 'react'
import Button from './ui/Button'
import PixPaymentModal from './PixPaymentModal'

export default function PixPaymentTrigger() {
  const [show, setShow] = useState(false)

  return (
    <>
      <Button className="w-full" size="lg" onClick={() => setShow(true)}>
        Ativar Premium via PIX
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </Button>

      {show && (
        <PixPaymentModal
          onClose={() => setShow(false)}
          onSuccess={() => setShow(false)}
        />
      )}
    </>
  )
}
