#!/usr/bin/env bash

#>>-------------------------------------------------------------------------
#>>-  Init
#>>-------------------------------------------------------------------------

__repo_shell_opts_set
(return 0 2>/dev/null) && _SOURCED="1" || _SOURCED="0"

#>>-------------------------------------------------------------------------
#>>-  Main
#>>-------------------------------------------------------------------------

log_header "Initializing Repository"

if [[ "${_SOURCED}" == "1" ]]; then

  log_step "Set executable permissions: $REPO_ROOT/.repo/scripts/*"
  __fs_glob_chmod_exec "$REPO_ROOT/.repo/scripts"

  log_step "Update PATH"
  __path_add_top "$REPO_ROOT/.repo/scripts"

  log_step "Install PNPM version defined in root package.json"
  corepack install # 1> /dev/null
fi

__repo_init_env

#>>-------------------------------------------------------------------------
#>>-  Cleanup
#>>-------------------------------------------------------------------------

__repo_shell_opts_unset

