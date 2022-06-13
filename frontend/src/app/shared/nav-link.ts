interface NavLink {
  title: string | null
  link: string | null
  children?: NavLink[]
  isDivider?: boolean
}

export default NavLink
