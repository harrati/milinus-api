const A = 1.0278
const B = 0.0278

export const brzycki = (weight: number, rep: number, wantedRep: number) => {
  const rm = weight / (A - B * rep)
  const optimalWeight = rm * (A - B * wantedRep)
  return Math.ceil(optimalWeight)
}
