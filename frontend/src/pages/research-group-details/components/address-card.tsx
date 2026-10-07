import type { GroupAddress } from '@/types/research-groups/research-group.types'

import { formatPostalCode, joinFilled } from '@/pages/research-group-details/research-group-format'
import { DetailsCard, DetailsList } from '@/pages/research-group-details/components/details-card'

export function AddressCard({ address }: { address: GroupAddress | null }) {
  const items = [
    { label: 'Rua', value: joinFilled([address?.street, address?.number]) },
    { label: 'Complemento', value: address?.complement || null },
    { label: 'Bairro', value: address?.neighborhood || null },
    { label: 'Cidade', value: joinFilled([address?.city, address?.state]) },
    { label: 'CEP', value: formatPostalCode(address?.postalCode ?? null) },
    { label: 'Caixa postal', value: address?.postOfficeBox || null },
  ]
  const hasAddress = items.some((item) => item.value)

  return (
    <DetailsCard id="group-address-title" title="Endereço">
      {hasAddress ? (
        <DetailsList items={items} compact />
      ) : (
        <p className="px-5 py-6 text-sm text-muted-foreground sm:px-6">Nenhum endereço cadastrado.</p>
      )}
    </DetailsCard>
  )
}
