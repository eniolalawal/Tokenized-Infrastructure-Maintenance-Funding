;; Fund Allocation Contract
;; Prioritizes repairs based on condition and usage

(define-data-var total-funds uint u0)

(define-map allocated-funds
  { asset-id: uint }
  {
    amount: uint,
    allocation-date: uint,
    priority: uint,
    usage-level: uint
  }
)

(define-public (contribute-funds (amount uint))
  (begin
    (var-set total-funds (+ (var-get total-funds) amount))
    (ok true)
  )
)

(define-public (allocate-funds
    (asset-id uint)
    (amount uint)
    (priority uint)
    (usage-level uint))
  (begin
    (asserts! (<= amount (var-get total-funds)) (err u1))
    (asserts! (<= priority u5) (err u2))
    (asserts! (<= usage-level u10) (err u3))

    (var-set total-funds (- (var-get total-funds) amount))
    (map-set allocated-funds
      { asset-id: asset-id }
      {
        amount: amount,
        allocation-date: block-height,
        priority: priority,
        usage-level: usage-level
      }
    )
    (ok true)
  )
)

(define-read-only (get-allocation (asset-id uint))
  (map-get? allocated-funds { asset-id: asset-id })
)

(define-read-only (get-total-funds)
  (var-get total-funds)
)

(define-public (transfer-allocation (from-asset uint) (to-asset uint))
  (let (
    (from-alloc (map-get? allocated-funds { asset-id: from-asset }))
  )
    (asserts! (is-some from-alloc) (err u4))
    (map-set allocated-funds
      { asset-id: to-asset }
      (unwrap-panic from-alloc)
    )
    (map-delete allocated-funds { asset-id: from-asset })
    (ok true)
  )
)
