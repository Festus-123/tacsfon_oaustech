export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  purposes: string[];
  instructions: string;
}

export const donationConfig: BankDetails = {
  accountName: "THE APOSTOLIC CHURCH STUDENT FELLOWSHIP",
  bankName: "United Bank for Africa (UBA)",
  accountNumber: "1112020021",
  currency: "NGN",
  purposes: [
    "Building Project",
    "Church Growth",
    "Fellowship Welfare & Outreach",
    "General Fellowship Support",
  ],
  instructions:
    "When transferring, please include your Name and the specific Giving Purpose (e.g. 'Building Project - John Doe') in the payment narration/remark.",
};
