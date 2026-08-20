import { create } from "zustand";
import type {
  Asset,
  Balance,
  SlippageTolerance,
  SwapExecution,
  SwapReviewSnapshot,
} from "@/domain";

export type ExecutionPhase = "idle" | "processing" | "success" | "failed";

/** FR-021: middle option (0.5%) is the default slippage tolerance. */
export const DEFAULT_SLIPPAGE: SlippageTolerance = 0.005;

export interface SwapState {
  readonly sourceAsset: Asset | null;
  readonly destinationAsset: Asset | null;
  readonly sourceAmountInput: string;
  readonly slippage: SlippageTolerance;
  readonly reviewSnapshot: SwapReviewSnapshot | null;
  readonly executionPhase: ExecutionPhase;
  readonly lastExecution: SwapExecution | null;
  readonly balances: Balance[];
}

export const initialSwapState: SwapState = {
  sourceAsset: null,
  destinationAsset: null,
  sourceAmountInput: "",
  slippage: DEFAULT_SLIPPAGE,
  reviewSnapshot: null,
  executionPhase: "idle",
  lastExecution: null,
  balances: [],
};

export interface SwapStore extends SwapState {
  setSourceAsset(asset: Asset | null): void;
  setDestinationAsset(asset: Asset | null): void;
  setSourceAmountInput(value: string): void;
  setSlippage(value: SlippageTolerance): void;
  setReviewSnapshot(snapshot: SwapReviewSnapshot | null): void;
  setExecutionPhase(phase: ExecutionPhase): void;
  setLastExecution(execution: SwapExecution | null): void;
  setBalances(balances: Balance[]): void;
  /** FR-024 "New swap": clears the reviewed/executed transaction and amount; keeps asset selection and balances. */
  resetSwapForm(): void;
}

/**
 * Deliberately minimal: plain data plus trivial setters only. No calculation,
 * validation, execution, or balance-transition logic lives here — those
 * remain Domain/Application responsibilities (architecture.md §3.4). Calling
 * Application use cases from state happens only in the separate
 * `swapActions.ts` integration boundary, never inside this store.
 */
export const useSwapStore = create<SwapStore>((set) => ({
  ...initialSwapState,
  setSourceAsset: (asset) => set({ sourceAsset: asset }),
  setDestinationAsset: (asset) => set({ destinationAsset: asset }),
  setSourceAmountInput: (value) => set({ sourceAmountInput: value }),
  setSlippage: (value) => set({ slippage: value }),
  setReviewSnapshot: (snapshot) => set({ reviewSnapshot: snapshot }),
  setExecutionPhase: (phase) => set({ executionPhase: phase }),
  setLastExecution: (execution) => set({ lastExecution: execution }),
  setBalances: (balances) => set({ balances }),
  resetSwapForm: () =>
    set({
      sourceAmountInput: "",
      reviewSnapshot: null,
      executionPhase: "idle",
      lastExecution: null,
    }),
}));
