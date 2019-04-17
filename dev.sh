(
  (cd controlpanel && yarn dev) &
  (cd frontend && yarn dev) &
  (cd unchained && yarn dev) &
) && wait 1
