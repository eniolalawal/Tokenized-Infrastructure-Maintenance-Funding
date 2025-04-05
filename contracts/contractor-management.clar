;; Contractor Management Contract
;; Handles selection and payment for work

(define-map contractors
  { contractor-id: principal }
  {
    name: (string-ascii 100),
    specialization: (string-ascii 50),
    rating: uint,
    completed-jobs: uint,
    active: bool
  }
)

(define-map work-orders
  { order-id: uint }
  {
    asset-id: uint,
    contractor: principal,
    budget: uint,
    start-date: uint,
    end-date: uint,
    status: (string-ascii 20),
    completed: bool
  }
)

(define-data-var next-order-id uint u0)

(define-public (register-contractor
    (name (string-ascii 100))
    (specialization (string-ascii 50)))
  (begin
    (map-set contractors
      { contractor-id: tx-sender }
      {
        name: name,
        specialization: specialization,
        rating: u0,
        completed-jobs: u0,
        active: true
      }
    )
    (ok true)
  )
)

(define-public (create-work-order
    (asset-id uint)
    (contractor principal)
    (budget uint)
    (duration uint))
  (let (
    (new-id (var-get next-order-id))
    (start-block block-height)
    (end-block (+ block-height duration))
  )
    (var-set next-order-id (+ new-id u1))
    (map-set work-orders
      { order-id: new-id }
      {
        asset-id: asset-id,
        contractor: contractor,
        budget: budget,
        start-date: start-block,
        end-date: end-block,
        status: "assigned",
        completed: false
      }
    )
    (ok new-id)
  )
)

(define-public (complete-work (order-id uint))
  (let (
    (order (map-get? work-orders { order-id: order-id }))
    (contractor-info (map-get? contractors { contractor-id: tx-sender }))
  )
    (asserts! (is-some order) (err u1))
    (asserts! (is-eq tx-sender (get contractor (unwrap-panic order))) (err u2))
    (asserts! (is-some contractor-info) (err u3))

    (map-set work-orders
      { order-id: order-id }
      (merge (unwrap-panic order)
        {
          status: "completed",
          completed: true
        }
      )
    )

    (map-set contractors
      { contractor-id: tx-sender }
      (merge (unwrap-panic contractor-info)
        {
          completed-jobs: (+ (get completed-jobs (unwrap-panic contractor-info)) u1)
        }
      )
    )

    (ok true)
  )
)

(define-public (rate-contractor (contractor principal) (rating uint))
  (let ((contractor-info (map-get? contractors { contractor-id: contractor })))
    (asserts! (is-some contractor-info) (err u1))
    (asserts! (<= rating u5) (err u4))

    (map-set contractors
      { contractor-id: contractor }
      (merge (unwrap-panic contractor-info)
        {
          rating: rating
        }
      )
    )
    (ok true)
  )
)

(define-read-only (get-contractor (contractor principal))
  (map-get? contractors { contractor-id: contractor })
)

(define-read-only (get-work-order (order-id uint))
  (map-get? work-orders { order-id: order-id })
)
