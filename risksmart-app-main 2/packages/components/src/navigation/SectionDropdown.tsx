import type { FC, JSX } from 'react';

type Props = React.HTMLProps<HTMLAnchorElement> & {
  icon?: JSX.Element;
  match?: boolean;
};

const SectionDropdown: FC<Props> = ({ match, icon, children, ...rest }) => {
  const defaultStyles = `transition-all duration-200 ease-in-out group no-underline px-[10px] rounded-md flex items-center space-x-4`;

  const sectionStyles = match
    ? 'text-navy bg-teal hover:text-navy hover:bg-teal'
    : 'text-white hover:text-white hover:bg-navy_light';

  const linkStyles = `h-full ${defaultStyles} ${sectionStyles}`;

  const iconStyles = `flex items-center justify-center transition-colors duration-200 ease-in-out ${
    match ? 'text-inherit' : 'text-teal group-hover:text-teal'
  }`;

  return (
    <a href={'#'} {...rest} className={linkStyles}>
      {icon && <span className={iconStyles}>{icon}</span>}
      {children}
    </a>
  );
};

export default SectionDropdown;
