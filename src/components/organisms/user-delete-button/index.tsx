import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeleteUser } from "@/hooks/api/gestao/users/useUserMutations";

type UserDeleteButtonProps = {
  userId: string;
  userName: string;
  /** Deleting yourself signs you out right away. */
  isSelf: boolean;
};

export function UserDeleteButton({
  userId,
  userName,
  isSelf,
}: UserDeleteButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const remove = useDeleteUser(userId, isSelf);

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title={isSelf ? "Excluir a sua conta?" : `Excluir ${userName}?`}
      description={
        isSelf
          ? "Você sai do sistema na hora e não consegue mais entrar com este e-mail. Isso não pode ser desfeito."
          : "A pessoa não consegue mais entrar. Isso não pode ser desfeito."
      }
      confirmLabel={isSelf ? "Excluir minha conta" : "Excluir usuário"}
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => {
            setOpen(false);
            if (!isSelf) navigate(ROUTES.users, { replace: true });
          },
        })
      }
    />
  );
}
