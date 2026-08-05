import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { ProviderDocumentsDto } from './dto/request/create-provider.dto';

export interface ProviderDocumentFieldConfig {
  key: keyof ProviderDocumentsDto;
  notFoundKey: string;
  alreadyAssignedKey: string;
  alreadyUsedKey: string;
  notPendingKey: string;
  notReplaceableKey: string;
}

export const PROVIDER_DOCUMENT_FIELDS: ProviderDocumentFieldConfig[] = [
  {
    key: 'logoId',
    notFoundKey: 'providers.errors.documents.notFound.logo',
    alreadyAssignedKey: 'providers.errors.documents.alreadyAssigned.logo',
    alreadyUsedKey: 'providers.errors.documents.alreadyUsed.logo',
    notPendingKey: 'providers.errors.documents.notPending.logo',
    notReplaceableKey: 'providers.errors.documents.notReplaceable.logo',
  },
  {
    key: 'recruitmentLicenseDocumentId',
    notFoundKey: 'providers.errors.documents.notFound.recruitmentLicenseDoc',
    alreadyAssignedKey:
      'providers.errors.documents.alreadyAssigned.recruitmentLicenseDoc',
    alreadyUsedKey:
      'providers.errors.documents.alreadyUsed.recruitmentLicenseDoc',
    notPendingKey:
      'providers.errors.documents.notPending.recruitmentLicenseDoc',
    notReplaceableKey:
      'providers.errors.documents.notReplaceable.recruitmentLicenseDoc',
  },
  {
    key: 'nationalAddressProofDocumentId',
    notFoundKey: 'providers.errors.documents.notFound.nationalAddressProofDoc',
    alreadyAssignedKey:
      'providers.errors.documents.alreadyAssigned.nationalAddressProofDoc',
    alreadyUsedKey:
      'providers.errors.documents.alreadyUsed.nationalAddressProofDoc',
    notPendingKey:
      'providers.errors.documents.notPending.nationalAddressProofDoc',
    notReplaceableKey:
      'providers.errors.documents.notReplaceable.nationalAddressProofDoc',
  },
  {
    key: 'ibanCertificateDocumentId',
    notFoundKey: 'providers.errors.documents.notFound.ibanCertificateDoc',
    alreadyAssignedKey:
      'providers.errors.documents.alreadyAssigned.ibanCertificateDoc',
    alreadyUsedKey: 'providers.errors.documents.alreadyUsed.ibanCertificateDoc',
    notPendingKey: 'providers.errors.documents.notPending.ibanCertificateDoc',
    notReplaceableKey:
      'providers.errors.documents.notReplaceable.ibanCertificateDoc',
  },
  {
    key: 'commercialRegistrationDocumentId',
    notFoundKey: 'providers.errors.documents.notFound.commercialDoc',
    alreadyAssignedKey:
      'providers.errors.documents.alreadyAssigned.commercialDoc',
    alreadyUsedKey: 'providers.errors.documents.alreadyUsed.commercialDoc',
    notPendingKey: 'providers.errors.documents.notPending.commercialDoc',
    notReplaceableKey:
      'providers.errors.documents.notReplaceable.commercialDoc',
  },
  {
    key: 'vatCertificateDocumentId',
    notFoundKey: 'providers.errors.documents.notFound.vatCertificateDoc',
    alreadyAssignedKey:
      'providers.errors.documents.alreadyAssigned.vatCertificateDoc',
    alreadyUsedKey: 'providers.errors.documents.alreadyUsed.vatCertificateDoc',
    notPendingKey: 'providers.errors.documents.notPending.vatCertificateDoc',
    notReplaceableKey:
      'providers.errors.documents.notReplaceable.vatCertificateDoc',
  },
];

// for expanding later
export const REPLACEABLE_TARGET_DOCUMENT_STATUSES = [
  DocumentStatusEnum.Rejected,
];
