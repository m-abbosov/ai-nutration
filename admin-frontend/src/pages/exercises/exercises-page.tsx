import { useEffect, useState } from "react";

import { ApiError } from "@nutriai/shared/api/client";
import { Plus, Trash2 } from "lucide-react";

import {
  useAdminExercise,
  useAdminExercises,
  useCreateExercise,
  useDeleteExercise,
  useUpdateExercise,
} from "@/shared/api/exercises";
import type {
  AdminExerciseListItemDto,
  CreateExerciseInput,
  ExerciseCategory,
  ExerciseLanguage,
  MuscleCode,
} from "@/shared/api/types";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { IfPermission } from "@/shared/rbac/admin-auth-context";
import { AdminHeader } from "@/shared/ui/admin-header";
import { AdminButton } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/shared/ui/data-table";
import { AdminDialog, AdminDialogContent, AdminDialogHeader, AdminDialogTitle } from "@/shared/ui/dialog";
import { AdminEmptyState, AdminErrorState } from "@/shared/ui/error-state";
import { FilterBar } from "@/shared/ui/filter-bar";
import { AdminInput } from "@/shared/ui/input";
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from "@/shared/ui/select";

const PAGE_SIZE = 20;
const CATEGORIES: ExerciseCategory[] = ["COMPOUND", "ISOLATION", "CARDIO", "BODYWEIGHT"];
const MUSCLES: MuscleCode[] = [
  "CHEST",
  "UPPER_CHEST",
  "BACK",
  "LATS",
  "TRAPS",
  "SHOULDERS",
  "FRONT_DELTS",
  "SIDE_DELTS",
  "REAR_DELTS",
  "BICEPS",
  "TRICEPS",
  "FOREARMS",
  "ABS",
  "OBLIQUES",
  "GLUTES",
  "QUADS",
  "HAMSTRINGS",
  "CALVES",
];

export function ExercisesPage() {
  const { t } = useAdminTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [muscle, setMuscle] = useState<string>("");
  const [formOpen, setFormOpen] = useState<{ mode: "create" } | { mode: "edit"; id: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminExerciseListItemDto | null>(null);

  const { data, isLoading, isError, refetch } = useAdminExercises({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    category: (category || undefined) as ExerciseCategory | undefined,
    muscle: (muscle || undefined) as MuscleCode | undefined,
  });

  const categoryLabel: Record<ExerciseCategory, string> = {
    COMPOUND: t.exercises.categoryCompound,
    ISOLATION: t.exercises.categoryIsolation,
    CARDIO: t.exercises.categoryCardio,
    BODYWEIGHT: t.exercises.categoryBodyweight,
  };

  const hasActiveFilters = !!(search || category || muscle);

  const columns: DataTableColumn<AdminExerciseListItemDto>[] = [
    { key: "name", header: t.exercises.colName, render: (row) => <span className="font-medium">{row.name}</span> },
    { key: "slug", header: t.exercises.colSlug, render: (row) => <span className="adm-mono text-[11.5px]">{row.slug}</span> },
    { key: "category", header: t.exercises.colCategory, render: (row) => <span>{categoryLabel[row.category]}</span> },
    { key: "primaryMuscle", header: t.exercises.colMuscle, render: (row) => <span>{t.exercises.muscles[row.primaryMuscle]}</span> },
    { key: "equipment", header: t.exercises.colEquipment, render: (row) => <span>{row.equipment ?? "—"}</span> },
    {
      key: "actions",
      header: t.common.actions,
      render: (row) => (
        <IfPermission permission="FITNESS_MANAGE">
          <div className="flex items-center gap-1">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFormOpen({ mode: "edit", id: row.id });
              }}
            >
              {t.common.view}
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
              }}
            >
              <Trash2 className="h-3 w-3" style={{ color: "var(--adm-critical)" }} />
            </AdminButton>
          </div>
        </IfPermission>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title={t.exercises.title}
        subtitle={t.exercises.subtitle}
        actions={
          <IfPermission permission="FITNESS_MANAGE">
            <AdminButton size="sm" onClick={() => setFormOpen({ mode: "create" })}>
              <Plus className="h-3.5 w-3.5" />
              {t.exercises.addExercise}
            </AdminButton>
          </IfPermission>
        }
      />

      <div className="mb-4">
        <FilterBar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t.exercises.searchPlaceholder}
          hasActiveFilters={hasActiveFilters}
          onClear={() => {
            setSearch("");
            setCategory("");
            setMuscle("");
            setPage(1);
          }}
        >
          <FilterSelect
            value={category}
            onChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
            placeholder={t.exercises.filterCategory}
            options={CATEGORIES.map((c) => ({ value: c, label: categoryLabel[c] }))}
          />
          <FilterSelect
            value={muscle}
            onChange={(v) => {
              setMuscle(v);
              setPage(1);
            }}
            placeholder={t.exercises.filterMuscle}
            options={MUSCLES.map((m) => ({ value: m, label: t.exercises.muscles[m] }))}
          />
        </FilterBar>
      </div>

      {isError ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowId={(row) => row.id}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={isLoading}
          emptyState={<AdminEmptyState message={t.exercises.noExercises} />}
        />
      )}

      {formOpen && <ExerciseFormDialog target={formOpen} onOpenChange={(open) => !open && setFormOpen(null)} />}

      {deleteTarget && <DeleteExerciseDialog exercise={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const { t } = useAdminTranslation();
  return (
    <AdminSelect value={value || "__all__"} onValueChange={(v) => onChange(v === "__all__" ? "" : v)}>
      <AdminSelectTrigger className="w-[170px]">
        <span className="mr-1" style={{ color: "var(--adm-text-3)" }}>
          {placeholder}:
        </span>
        <AdminSelectValue className="flex-1 text-left" />
      </AdminSelectTrigger>
      <AdminSelectContent>
        <AdminSelectItem value="__all__">{t.common.all}</AdminSelectItem>
        {options.map((o) => (
          <AdminSelectItem key={o.value} value={o.value}>
            {o.label}
          </AdminSelectItem>
        ))}
      </AdminSelectContent>
    </AdminSelect>
  );
}

function DeleteExerciseDialog({ exercise, onOpenChange }: { exercise: AdminExerciseListItemDto; onOpenChange: (open: boolean) => void }) {
  const { t } = useAdminTranslation();
  const mutation = useDeleteExercise();
  const errorMessage =
    mutation.error instanceof ApiError && mutation.error.statusCode === 409 ? t.exercises.deleteInUseError : mutation.isError ? t.exercises.saveError : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title={t.exercises.deleteConfirmTitle}
      description={errorMessage ?? t.exercises.deleteConfirmBody}
      destructive
      confirmLabel={t.exercises.deleteExercise}
      loading={mutation.isPending}
      onConfirm={() => mutation.mutate(exercise.id, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

interface AliasFormState {
  EN: string;
  RU: string;
  UZ: string;
}

interface SecondaryMuscleRow {
  muscle: MuscleCode;
  weight: number;
}

function ExerciseFormDialog({
  target,
  onOpenChange,
}: {
  target: { mode: "create" } | { mode: "edit"; id: string };
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useAdminTranslation();
  const isEdit = target.mode === "edit";
  const { data: existing, isLoading: isLoadingExisting } = useAdminExercise(isEdit ? target.id : undefined);
  const create = useCreateExercise();
  const update = useUpdateExercise(isEdit ? target.id : "");

  const [names, setNames] = useState<AliasFormState>({ EN: "", RU: "", UZ: "" });
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>("COMPOUND");
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleCode>("CHEST");
  const [equipment, setEquipment] = useState("");
  const [secondaryMuscles, setSecondaryMuscles] = useState<SecondaryMuscleRow[]>([]);

  useEffect(() => {
    if (!existing) return;
    const byLang = (lang: ExerciseLanguage) => existing.aliases.find((a) => a.language === lang)?.alias ?? "";
    setNames({ EN: byLang("EN"), RU: byLang("RU"), UZ: byLang("UZ") });
    setSlug(existing.slug);
    setCategory(existing.category);
    setPrimaryMuscle(existing.primaryMuscle);
    setEquipment(existing.equipment ?? "");
    setSecondaryMuscles(existing.secondaryMuscles);
  }, [existing]);

  const mutation = isEdit ? update : create;
  const canSubmit = names.EN.trim().length > 0;

  const handleSubmit = () => {
    const aliases = (Object.entries(names) as [ExerciseLanguage, string][])
      .filter(([, alias]) => alias.trim().length > 0)
      .map(([language, alias]) => ({ language, alias: alias.trim(), isPrimary: true }));

    const payload: CreateExerciseInput = {
      slug: slug.trim() || undefined,
      category,
      primaryMuscle,
      equipment: equipment.trim() || null,
      aliases,
      secondaryMuscles: secondaryMuscles.filter((s) => s.muscle !== primaryMuscle),
    };

    if (isEdit) {
      update.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const addSecondaryMuscle = () => {
    const unused = MUSCLES.find((m) => m !== primaryMuscle && !secondaryMuscles.some((s) => s.muscle === m));
    if (!unused) return;
    setSecondaryMuscles((prev) => [...prev, { muscle: unused, weight: 0.3 }]);
  };

  return (
    <AdminDialog open onOpenChange={onOpenChange}>
      <AdminDialogContent className="max-w-[520px]">
        <AdminDialogHeader>
          <AdminDialogTitle>{isEdit ? t.exercises.editExercise : t.exercises.addExercise}</AdminDialogTitle>
        </AdminDialogHeader>

        {isEdit && isLoadingExisting ? (
          <div className="py-6 text-center text-[12px]" style={{ color: "var(--adm-text-3)" }}>
            {t.common.loading}
          </div>
        ) : (
          <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
            <FormField label={t.exercises.formNameEn}>
              <AdminInput value={names.EN} onChange={(e) => setNames((p) => ({ ...p, EN: e.target.value }))} />
            </FormField>
            <FormField label={t.exercises.formNameRu}>
              <AdminInput value={names.RU} onChange={(e) => setNames((p) => ({ ...p, RU: e.target.value }))} />
            </FormField>
            <FormField label={t.exercises.formNameUz}>
              <AdminInput value={names.UZ} onChange={(e) => setNames((p) => ({ ...p, UZ: e.target.value }))} />
            </FormField>
            <FormField label={t.exercises.formSlug} hint={t.exercises.formSlugHint}>
              <AdminInput value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={isEdit ? undefined : "auto"} />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label={t.exercises.formCategory}>
                <AdminSelect value={category} onValueChange={(v) => setCategory(v as ExerciseCategory)}>
                  <AdminSelectTrigger className="w-full">
                    <AdminSelectValue />
                  </AdminSelectTrigger>
                  <AdminSelectContent>
                    {CATEGORIES.map((c) => (
                      <AdminSelectItem key={c} value={c}>
                        {c === "COMPOUND"
                          ? t.exercises.categoryCompound
                          : c === "ISOLATION"
                            ? t.exercises.categoryIsolation
                            : c === "CARDIO"
                              ? t.exercises.categoryCardio
                              : t.exercises.categoryBodyweight}
                      </AdminSelectItem>
                    ))}
                  </AdminSelectContent>
                </AdminSelect>
              </FormField>
              <FormField label={t.exercises.formPrimaryMuscle}>
                <AdminSelect value={primaryMuscle} onValueChange={(v) => setPrimaryMuscle(v as MuscleCode)}>
                  <AdminSelectTrigger className="w-full">
                    <AdminSelectValue />
                  </AdminSelectTrigger>
                  <AdminSelectContent>
                    {MUSCLES.map((m) => (
                      <AdminSelectItem key={m} value={m}>
                        {t.exercises.muscles[m]}
                      </AdminSelectItem>
                    ))}
                  </AdminSelectContent>
                </AdminSelect>
              </FormField>
            </div>

            <FormField label={t.exercises.formEquipment}>
              <AdminInput value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder={t.exercises.formEquipmentPlaceholder} />
            </FormField>

            <div>
              <div className="mb-1.5 text-[11px] font-medium" style={{ color: "var(--adm-text-2)" }}>
                {t.exercises.formSecondaryMuscles}
              </div>
              <div className="flex flex-col gap-2">
                {secondaryMuscles.map((row, i) => (
                  <div key={row.muscle} className="flex items-center gap-2">
                    <AdminSelect
                      value={row.muscle}
                      onValueChange={(v) =>
                        setSecondaryMuscles((prev) => prev.map((r, idx) => (idx === i ? { ...r, muscle: v as MuscleCode } : r)))
                      }
                    >
                      <AdminSelectTrigger className="flex-1">
                        <AdminSelectValue />
                      </AdminSelectTrigger>
                      <AdminSelectContent>
                        {MUSCLES.filter((m) => m !== primaryMuscle).map((m) => (
                          <AdminSelectItem key={m} value={m}>
                            {t.exercises.muscles[m]}
                          </AdminSelectItem>
                        ))}
                      </AdminSelectContent>
                    </AdminSelect>
                    <AdminInput
                      type="number"
                      min={0}
                      max={1}
                      step={0.1}
                      value={row.weight}
                      onChange={(e) =>
                        setSecondaryMuscles((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, weight: Number(e.target.value) } : r)),
                        )
                      }
                      className="w-[70px]"
                    />
                    <AdminButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setSecondaryMuscles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--adm-critical)" }} />
                    </AdminButton>
                  </div>
                ))}
                <AdminButton variant="secondary" size="sm" onClick={addSecondaryMuscle} disabled={secondaryMuscles.length >= MUSCLES.length - 1}>
                  <Plus className="h-3 w-3" />
                  {t.exercises.addSecondaryMuscle}
                </AdminButton>
              </div>
            </div>

            {mutation.isError && (
              <p className="text-[11.5px]" style={{ color: "var(--adm-critical)" }}>
                {t.exercises.saveError}
              </p>
            )}

            <div className="mt-1 flex justify-end gap-2">
              <AdminButton variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                {t.common.cancel}
              </AdminButton>
              <AdminButton size="sm" disabled={!canSubmit || mutation.isPending} onClick={handleSubmit}>
                {t.common.save}
              </AdminButton>
            </div>
          </div>
        )}
      </AdminDialogContent>
    </AdminDialog>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium" style={{ color: "var(--adm-text-2)" }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[10.5px]" style={{ color: "var(--adm-text-3)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}
