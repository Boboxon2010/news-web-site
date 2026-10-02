interface AddressLinkProps {
  address: string;
  className?: string;
}

export default function AddressLink({ address, className = '' }: AddressLinkProps) {
  return (
    <a
      href="https://maps.app.goo.gl/B5FzDuqxDhgLYRXB8"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {address}
    </a>
  );
}