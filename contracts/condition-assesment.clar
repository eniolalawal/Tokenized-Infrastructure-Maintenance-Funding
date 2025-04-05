;; Condition Assessment Contract
;; Tracks deterioration and maintenance needs

(define-map asset-conditions
  { asset-id: uint }
  {
    condition-score: uint,
    assessment-date: uint,
    assessor: principal,
    description: (string-ascii 200),
    maintenance-required: bool
  }
)

(define-public (record-assessment
    (asset-id uint)
    (condition-score uint)
    (description (string-ascii 200))
    (maintenance-required bool))
  (begin
    (asserts! (<= condition-score u10) (err u1))
    (map-set asset-conditions
      { asset-id: asset-id }
      {
        condition-score: condition-score,
        assessment-date: block-height,
        assessor: tx-sender,
        description: description,
        maintenance-required: maintenance-required
      }
    )
    (ok true)
  )
)

(define-read-only (get-condition (asset-id uint))
  (map-get? asset-conditions { asset-id: asset-id })
)

(define-read-only (needs-maintenance (asset-id uint))
  (let ((condition (map-get? asset-conditions { asset-id: asset-id })))
    (if (is-some condition)
      (get maintenance-required (unwrap-panic condition))
      false
    )
  )
)

(define-read-only (get-condition-score (asset-id uint))
  (let ((condition (map-get? asset-conditions { asset-id: asset-id })))
    (if (is-some condition)
      (some (get condition-score (unwrap-panic condition)))
      none
    )
  )
)
