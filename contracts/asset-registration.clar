;; Asset Registration Contract
;; Records details of public infrastructure

(define-data-var next-asset-id uint u0)

(define-map assets
  { asset-id: uint }
  {
    name: (string-ascii 100),
    location: (string-ascii 100),
    asset-type: (string-ascii 50),
    construction-date: uint,
    last-maintenance: uint,
    owner: principal
  }
)

(define-public (register-asset
    (name (string-ascii 100))
    (location (string-ascii 100))
    (asset-type (string-ascii 50))
    (construction-date uint))
  (let ((new-id (var-get next-asset-id)))
    (var-set next-asset-id (+ new-id u1))
    (map-set assets
      { asset-id: new-id }
      {
        name: name,
        location: location,
        asset-type: asset-type,
        construction-date: construction-date,
        last-maintenance: u0,
        owner: tx-sender
      }
    )
    (ok new-id)
  )
)

(define-read-only (get-asset (asset-id uint))
  (map-get? assets { asset-id: asset-id })
)

(define-read-only (get-asset-count)
  (var-get next-asset-id)
)

(define-public (update-maintenance (asset-id uint) (maintenance-date uint))
  (let ((asset (map-get? assets { asset-id: asset-id })))
    (asserts! (is-some asset) (err u1))
    (asserts! (is-eq tx-sender (get owner (unwrap-panic asset))) (err u2))

    (map-set assets
      { asset-id: asset-id }
      (merge (unwrap-panic asset) { last-maintenance: maintenance-date })
    )
    (ok true)
  )
)
