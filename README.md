# Run and deploy your app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Cálculo de Custo de Combustível

O arquivo `services/costService.ts` possui utilidades para estimar o gasto de combustível até um determinado endereço. O cálculo usa o serviço público do OpenStreetMap para geocodificação e rota, considerando:

- Endereço de origem definido em `COMPANY_BASE_ADDRESS` em `constants.ts`;
- Preço do litro de combustível;
- Consumo médio do veículo (km por litro);
- Valor total de pedágios (opcional).

O resultado inclui distância, litros necessários e o custo total da viagem.

### Página de Simulação

Use a rota `/custo-deslocamento` para abrir a página de simulação de custo de deslocamento. A calculadora agora considera automaticamente **ida e volta**. Se o campo de pedágio ficar em branco, o valor será buscado na API da TollGuru (é necessário definir `TOLLGURU_API_KEY` no ambiente). O cálculo parte do endereço definido em `COMPANY_BASE_ADDRESS` (atualmente "Rua Dionisio Erthal 69, Santa Rosa, Niterói RJ").

### Admin Panel

Há uma visão alternativa de administração disponível em `/admin`. Ela pode ser usada para experimentar diferentes layouts ou funcionalidades específicas para administradores.

## Complete Inspection Template

The file `inspectionTemplate.ts` lists all sections and fields used in the
"modelo completo" of um laudo de inspeção. These fields cobrem desde dados
gerais da vistoria até manifestações sobre a garantia e conclusão da
vistoria. O arquivo pode ser estendido se surgirem novas exigências.
