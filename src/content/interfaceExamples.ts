/**
 * Sample data for the interface panels (OSINT Scanner). Illustrative only.
 *
 * The output format mirrors the real kuyfi_tui attack surface map (`name(params) → Has Return` or
 * `Void`), but these are example signatures, not the result of scanning a real contract. The panel
 * always carries the "interface example" tag and a note saying so. No counts are shown anywhere:
 * numbers about real contracts belong to evidence.ts and are not surfaced here.
 */

export interface ExampleArg {
  name: string
  type: string
}

export interface ExampleFunction {
  name: string
  args: readonly ExampleArg[]
  returns: 'Has Return' | 'Void'
}

export interface ExampleType {
  kind: 'struct'
  name: string
  fields: readonly ExampleArg[]
}

export const osintExample = {
  functions: [
    {
      name: 'add_liquidity',
      args: [
        { name: 'from', type: 'Address' },
        { name: 'amount_a', type: 'i128' },
        { name: 'amount_b', type: 'i128' },
      ],
      returns: 'Has Return',
    },
    {
      name: 'swap',
      args: [
        { name: 'from', type: 'Address' },
        { name: 'params', type: 'SwapParams' },
      ],
      returns: 'Has Return',
    },
    {
      name: 'set_fee_bps',
      args: [
        { name: 'admin', type: 'Address' },
        { name: 'fee_bps', type: 'u32' },
      ],
      returns: 'Void',
    },
  ],
  types: [
    {
      kind: 'struct',
      name: 'SwapParams',
      fields: [
        { name: 'amount_in', type: 'i128' },
        { name: 'min_out', type: 'i128' },
      ],
    },
  ],
} as const satisfies { functions: readonly ExampleFunction[]; types: readonly ExampleType[] }
