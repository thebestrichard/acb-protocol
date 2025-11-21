import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/wagmi';
import { CreditScoreABI, CreditPoolABI, LoanManagerABI } from '@/lib/abis';
import { parseEther, formatEther } from 'viem';

// Credit Score hooks
export function useCreditScore(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creditScore as `0x${string}`,
    abi: CreditScoreABI,
    functionName: 'getCreditData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// Credit Pool hooks
export function usePoolStats() {
  const { data: totalLiquidity } = useReadContract({
    address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
    abi: CreditPoolABI,
    functionName: 'totalLiquidity',
  });

  const { data: totalBorrowed } = useReadContract({
    address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
    abi: CreditPoolABI,
    functionName: 'totalBorrowed',
  });

  return {
    totalLiquidity: totalLiquidity ? formatEther(totalLiquidity) : '0',
    totalBorrowed: totalBorrowed ? formatEther(totalBorrowed) : '0',
  };
}

export function useMaxBorrowAmount(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
    abi: CreditPoolABI,
    functionName: 'getMaxBorrowAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useInterestRate(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
    abi: CreditPoolABI,
    functionName: 'calculateInterestRate',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useLpValue(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
    abi: CreditPoolABI,
    functionName: 'getLpValue',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useLpTokens(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
    abi: CreditPoolABI,
    functionName: 'lpTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// Deposit hook
export function useDeposit() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
      abi: CreditPoolABI,
      functionName: 'deposit',
      value: parseEther(amount),
    });
  };

  return {
    deposit,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

// Withdraw hook
export function useWithdraw() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = (lpAmount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.creditPool as `0x${string}`,
      abi: CreditPoolABI,
      functionName: 'withdraw',
      args: [parseEther(lpAmount)],
    });
  };

  return {
    withdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

// Loan Manager hooks
export function useUserLoans(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.loanManager as `0x${string}`,
    abi: LoanManagerABI,
    functionName: 'getUserLoans',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useLoanDetails(loanId?: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.loanManager as `0x${string}`,
    abi: LoanManagerABI,
    functionName: 'getLoan',
    args: loanId !== undefined ? [loanId] : undefined,
    query: {
      enabled: loanId !== undefined,
    },
  });
}

export function useTotalOwed(loanId?: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.loanManager as `0x${string}`,
    abi: LoanManagerABI,
    functionName: 'calculateTotalOwed',
    args: loanId !== undefined ? [loanId] : undefined,
    query: {
      enabled: loanId !== undefined,
    },
  });
}

// Request loan hook
export function useRequestLoan() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const requestLoan = (amount: string, durationDays: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.loanManager as `0x${string}`,
      abi: LoanManagerABI,
      functionName: 'requestLoan',
      args: [parseEther(amount), BigInt(durationDays)],
    });
  };

  return {
    requestLoan,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

// Repay loan hook
export function useRepayLoan() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const repayLoan = (loanId: bigint, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.loanManager as `0x${string}`,
      abi: LoanManagerABI,
      functionName: 'repayLoan',
      args: [loanId],
      value: parseEther(amount),
    });
  };

  return {
    repayLoan,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}
