import { useParams } from "react-router-dom";
import { QuestionnaireFlow } from "@/components/organisms/questionnaire-flow";
import { PublicLayout } from "@/components/templates/public-layout";

/** The public questionnaire, one step at a time, resumable from the link. */
export function QuestionnairePage() {
  const { token = "" } = useParams();
  return (
    <PublicLayout>
      <QuestionnaireFlow token={token} />
    </PublicLayout>
  );
}
