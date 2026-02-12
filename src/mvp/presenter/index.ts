import type { AppModel } from "../model";
import { formatTitle } from "../usecase";
import { useQuery } from "@tanstack/react-query";
import { createQueryClient, fetchSummary, summaryQueryKey } from "../service";
import { t } from "@mfe-sols/i18n";

export type AppViewModel = {
  title: string;
  headings: string[];
};

export const createPresenter = (model: AppModel): AppViewModel => ({
  title: formatTitle(`${model.appName} ${t(model.titleSuffixKey)}`),
  headings: model.headingKeys.map((key) => t(key)),
});

export const useSummaryQuery = () =>
  useQuery({
    queryKey: summaryQueryKey,
    queryFn: fetchSummary,
  });

export const fetchSummaryExample = async () => {
  const client = createQueryClient();
  return client.fetchQuery({
    queryKey: summaryQueryKey,
    queryFn: fetchSummary,
  });
};

export const loadSummary = () => {
  const client = createQueryClient();
  return client.fetchQuery({
    queryKey: summaryQueryKey,
    queryFn: fetchSummary,
  });
};
