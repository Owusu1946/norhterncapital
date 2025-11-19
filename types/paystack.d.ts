declare module '@paystack/inline-js' {
  interface PaystackOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    metadata?: Record<string, any>;
    channels?: string[];
    onSuccess?: (transaction: any) => void;
    onCancel?: () => void;
    onClose?: () => void;
  }

  interface PaystackPopInstance {
    resumeTransaction(accessCode: string): void;
    newTransaction(options: PaystackOptions): void;
  }

  export default class PaystackPop {
    constructor();
    resumeTransaction(accessCode: string): void;
    newTransaction(options: PaystackOptions): void;
  }
}
