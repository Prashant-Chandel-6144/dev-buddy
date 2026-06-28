"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { githubRepoKeys } from "@/features/github/lib/repos-query";

import { Button } from "@/components/ui/button";
import { RepoSyncStatus } from "../types";
import { toast } from "sonner";
import { syncRepoCodebase } from "../action/repo-sync";

type SyncRepoButtonProps = {
  repoFullName: string;
  branch: string;
  syncStatus: RepoSyncStatus | null;
};

function isSyncing(status: RepoSyncStatus | null, mutationPending: boolean) {
  if (mutationPending) {
    return true;
  }

  return status === "pending" || status === "syncing";
}

function getButtonLabel(
  status: RepoSyncStatus | null,
  mutationPending: boolean,
) {
  if (isSyncing(status, mutationPending)) {
    return "Syncing…";
  }

  if (status === "synced") {
    return "Re-sync";
  }

  return "Sync";
}

const SyncRepoButton = ({
  repoFullName,
  branch,
  syncStatus,
}: SyncRepoButtonProps) => {
  const queryclient = useQueryClient();

  const syncRepo = useMutation({
    mutationFn: () => syncRepoCodebase(repoFullName, branch),
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: githubRepoKeys.all });
      toast.success("Repo synced successfully");
    },
    onError: (error) => {
      toast.error(`Failed to sync repo ${repoFullName}: ${error.message}`);
    },
  });
  const syncing = isSyncing(syncStatus, syncRepo.isPending);
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={syncing}
      onClick={() => syncRepo.mutate()}
    >
      {getButtonLabel(syncStatus, syncRepo.isPending)}
    </Button>
  );
};

export default SyncRepoButton;
