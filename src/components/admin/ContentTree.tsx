"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Infer listener/attribute types from useSortable's return value
type SortableReturn = ReturnType<typeof useSortable>;
type DragListeners = SortableReturn["listeners"];
type DragAttributes = SortableReturn["attributes"];
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Check,
  X,
  BookOpen,
  Layers,
  FolderOpen,
  FileText,
  GripVertical,
} from "lucide-react";
import {
  criarCursoContent,
  criarDisciplinaContent,
  criarAreaContent,
  criarTopicoContent,
  reordenarItens,
} from "@/lib/actions/content";

type TreeTopico = { id: string; titulo: string; publicado: boolean };
type TreeArea = { id: string; nome: string; publicado: boolean; topicos: TreeTopico[] };
type TreeDisciplina = { id: string; nome: string; icone: string | null; publicado: boolean; areas: TreeArea[] };
type TreeCurso = { id: string; nome: string; icone: string | null; publicado: boolean; disciplinas: TreeDisciplina[] };

interface Props {
  tree: TreeCurso[];
  selectedId?: string;
  selectedType?: string;
}

function getInitialExpanded(tree: TreeCurso[], selectedId?: string, selectedType?: string): Set<string> {
  const expanded = new Set<string>();
  if (!selectedId || !selectedType) return expanded;
  for (const curso of tree) {
    if (selectedType === "curso" && curso.id === selectedId) { expanded.add(curso.id); return expanded; }
    for (const disc of curso.disciplinas) {
      if (selectedType === "disciplina" && disc.id === selectedId) { expanded.add(curso.id); expanded.add(disc.id); return expanded; }
      for (const area of disc.areas) {
        if (selectedType === "area" && area.id === selectedId) { expanded.add(curso.id); expanded.add(disc.id); expanded.add(area.id); return expanded; }
        for (const topico of area.topicos) {
          if (selectedType === "topico" && topico.id === selectedId) { expanded.add(curso.id); expanded.add(disc.id); expanded.add(area.id); return expanded; }
        }
      }
    }
  }
  return expanded;
}

type CreateMode = { type: "disciplina" | "area" | "topico" | "curso"; parentId?: string } | null;

function StatusDot({ publicado }: { publicado: boolean }) {
  return (
    <span className="h-1.5 w-1.5 rounded-full shrink-0"
      style={{ backgroundColor: publicado ? "var(--success)" : "var(--warning)" }} />
  );
}

interface InlineFormProps {
  action: (fd: FormData) => Promise<void>;
  onCancel: () => void;
  placeholder: string;
  fieldName?: string;
  indent: number;
}

function InlineForm({ action, onCancel, placeholder, fieldName = "nome", indent }: InlineFormProps) {
  return (
    <form action={action} style={{ paddingLeft: indent }} className="py-1 pr-2">
      <div className="flex items-center gap-1">
        <input name={fieldName} required autoFocus placeholder={placeholder}
          className="flex-1 h-7 px-2 rounded text-xs outline-none"
          style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--accent)", color: "var(--text-primary)" }} />
        <button type="submit" className="h-7 w-7 flex items-center justify-center rounded text-white shrink-0"
          style={{ backgroundColor: "var(--accent)" }}>
          <Check className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onCancel}
          className="h-7 w-7 flex items-center justify-center rounded shrink-0"
          style={{ color: "var(--text-muted)" }}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}

interface NodeRowProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  publicado: boolean;
  indent: number;
  onToggle: () => void;
  onSelect: () => void;
  onAdd?: () => void;
  addTitle?: string;
  dragListeners?: DragListeners;
  dragAttributes?: DragAttributes;
}

function NodeRow({
  label, icon, isSelected, hasChildren, isExpanded, publicado,
  indent, onToggle, onSelect, onAdd, addTitle,
  dragListeners, dragAttributes,
}: NodeRowProps) {
  return (
    <div
      className="flex items-center rounded-md group cursor-pointer select-none"
      style={{
        paddingLeft: indent - 12,
        paddingRight: 8,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: isSelected ? "var(--accent)1a" : undefined,
        borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
      }}
    >
      {/* Drag handle */}
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing mr-1"
        style={{ color: "var(--text-muted)", touchAction: "none" }}
        {...dragListeners}
        {...dragAttributes}
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(); }}
        className="h-4 w-4 flex items-center justify-center shrink-0"
        style={{ color: "var(--text-muted)", visibility: hasChildren ? "visible" : "hidden" }}
      >
        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* Label */}
      <div className="flex-1 flex items-center gap-1.5 min-w-0" onClick={onSelect}>
        {icon && <span className="shrink-0" style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}>{icon}</span>}
        <span className="text-sm truncate"
          style={{ color: isSelected ? "var(--accent)" : "var(--text-secondary)", fontWeight: isSelected ? 600 : 400 }}>
          {label}
        </span>
        <StatusDot publicado={publicado} />
      </div>

      {/* Add child */}
      {onAdd && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          title={addTitle}
          className="h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function SortableNodeRow(props: NodeRowProps) {
  const { setNodeRef, transform, transition, isDragging, listeners, attributes } = useSortable({ id: props.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: "relative",
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <NodeRow {...props} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
}

export function ContentTree({ tree, selectedId, selectedType }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(
    () => getInitialExpanded(tree, selectedId, selectedType)
  );
  const [creating, setCreating] = useState<CreateMode>(null);
  const [search, setSearch] = useState("");

  // ── Lookup maps ──────────────────────────────────────────────────────────
  const cursosById = useMemo(() => new Map(tree.map((c) => [c.id, c])), [tree]);
  const discsById = useMemo(() => new Map(tree.flatMap((c) => c.disciplinas.map((d) => [d.id, d]))), [tree]);
  const areasById = useMemo(() => new Map(tree.flatMap((c) => c.disciplinas.flatMap((d) => d.areas.map((a) => [a.id, a])))), [tree]);
  const topicosById = useMemo(() => new Map(tree.flatMap((c) => c.disciplinas.flatMap((d) => d.areas.flatMap((a) => a.topicos.map((t) => [t.id, t]))))), [tree]);

  // ── Order state ──────────────────────────────────────────────────────────
  // Map: parentId (or "root") → ordered child ids
  const { initOrders, parentOf, entityType } = useMemo(() => {
    const initOrders = new Map<string, string[]>();
    const parentOf = new Map<string, string>();
    const entityType = new Map<string, "curso" | "disciplina" | "area" | "topico">();
    initOrders.set("root", tree.map((c) => c.id));
    for (const c of tree) {
      parentOf.set(c.id, "root"); entityType.set(c.id, "curso");
      initOrders.set(c.id, c.disciplinas.map((d) => d.id));
      for (const d of c.disciplinas) {
        parentOf.set(d.id, c.id); entityType.set(d.id, "disciplina");
        initOrders.set(d.id, d.areas.map((a) => a.id));
        for (const a of d.areas) {
          parentOf.set(a.id, d.id); entityType.set(a.id, "area");
          initOrders.set(a.id, a.topicos.map((t) => t.id));
          for (const t of a.topicos) {
            parentOf.set(t.id, a.id); entityType.set(t.id, "topico");
          }
        }
      }
    }
    return { initOrders, parentOf, entityType };
  }, [tree]);

  const [orders, setOrders] = useState<Map<string, string[]>>(initOrders);

  // ── DnD ─────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const parentId = parentOf.get(activeId);
    if (!parentId) return;
    const list = orders.get(parentId) ?? [];
    const oldIdx = list.indexOf(activeId);
    const newIdx = list.indexOf(overId);
    if (oldIdx === -1 || newIdx === -1) return; // different groups — ignore
    const newList = arrayMove(list, oldIdx, newIdx);
    setOrders((prev) => new Map(prev).set(parentId, newList));
    const tipo = entityType.get(activeId)!;
    reordenarItens(tipo, newList.map((id, idx) => ({ id, ordem: idx })));
  }

  // ── Tree helpers ─────────────────────────────────────────────────────────
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const select = (type: string, id: string) => router.push(`/admin/content?${type}=${id}`);

  const startCreate = (type: NonNullable<CreateMode>["type"], parentId?: string) => {
    setCreating({ type, parentId });
    if (parentId) setExpanded((prev) => new Set([...prev, parentId]));
  };

  // ── Search filter ────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredTree = q
    ? tree.map((curso) => ({
        ...curso,
        disciplinas: curso.disciplinas
          .map((disc) => ({
            ...disc,
            areas: disc.areas
              .map((area) => ({ ...area, topicos: area.topicos.filter((t) => t.titulo.toLowerCase().includes(q)) }))
              .filter((area) => area.nome.toLowerCase().includes(q) || area.topicos.length > 0),
          }))
          .filter((disc) => disc.nome.toLowerCase().includes(q) || disc.areas.length > 0),
      }))
      .filter((c) => c.nome.toLowerCase().includes(q) || c.disciplinas.length > 0)
    : tree;

  // When searching, skip ordering (search results are already filtered)
  const orderedCursos = q
    ? filteredTree
    : (orders.get("root") ?? []).map((id) => cursosById.get(id)).filter(Boolean) as TreeCurso[];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-full border-r overflow-hidden"
      style={{ width: 280, minWidth: 280, backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contenido..."
          className="w-full h-8 px-3 rounded-lg text-xs outline-none"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {orderedCursos.length === 0 && !creating ? (
          <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>
            {search ? "Sin resultados" : "Sin contenido aún"}
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orders.get("root") ?? []} strategy={verticalListSortingStrategy}>
              {orderedCursos.map((curso) => {
                const orderedDiscs = (orders.get(curso.id) ?? []).map((id) => discsById.get(id)).filter(Boolean) as TreeDisciplina[];
                return (
                  <div key={curso.id}>
                    <SortableNodeRow
                      id={curso.id}
                      label={curso.nome}
                      icon={curso.icone ? <span className="text-sm">{curso.icone}</span> : <BookOpen className="h-3.5 w-3.5" />}
                      isSelected={selectedId === curso.id && selectedType === "curso"}
                      hasChildren={curso.disciplinas.length > 0}
                      isExpanded={expanded.has(curso.id)}
                      publicado={curso.publicado}
                      indent={20}
                      onToggle={() => toggle(curso.id)}
                      onSelect={() => select("curso", curso.id)}
                      onAdd={() => startCreate("disciplina", curso.id)}
                      addTitle="Nueva materia"
                    />

                    {expanded.has(curso.id) && (
                      <>
                        <SortableContext items={orders.get(curso.id) ?? []} strategy={verticalListSortingStrategy}>
                          {orderedDiscs.map((disc) => {
                            const orderedAreas = (orders.get(disc.id) ?? []).map((id) => areasById.get(id)).filter(Boolean) as TreeArea[];
                            return (
                              <div key={disc.id}>
                                <SortableNodeRow
                                  id={disc.id}
                                  label={disc.nome}
                                  icon={disc.icone ? <span className="text-sm">{disc.icone}</span> : <Layers className="h-3.5 w-3.5" />}
                                  isSelected={selectedId === disc.id && selectedType === "disciplina"}
                                  hasChildren={disc.areas.length > 0}
                                  isExpanded={expanded.has(disc.id)}
                                  publicado={disc.publicado}
                                  indent={36}
                                  onToggle={() => toggle(disc.id)}
                                  onSelect={() => select("disciplina", disc.id)}
                                  onAdd={() => startCreate("area", disc.id)}
                                  addTitle="Nueva unidad"
                                />

                                {expanded.has(disc.id) && (
                                  <>
                                    <SortableContext items={orders.get(disc.id) ?? []} strategy={verticalListSortingStrategy}>
                                      {orderedAreas.map((area) => {
                                        const orderedTopicos = (orders.get(area.id) ?? []).map((id) => topicosById.get(id)).filter(Boolean) as TreeTopico[];
                                        return (
                                          <div key={area.id}>
                                            <SortableNodeRow
                                              id={area.id}
                                              label={area.nome}
                                              icon={<FolderOpen className="h-3.5 w-3.5" />}
                                              isSelected={selectedId === area.id && selectedType === "area"}
                                              hasChildren={area.topicos.length > 0}
                                              isExpanded={expanded.has(area.id)}
                                              publicado={area.publicado}
                                              indent={52}
                                              onToggle={() => toggle(area.id)}
                                              onSelect={() => select("area", area.id)}
                                              onAdd={() => startCreate("topico", area.id)}
                                              addTitle="Nuevo tópico"
                                            />

                                            {expanded.has(area.id) && (
                                              <>
                                                <SortableContext items={orders.get(area.id) ?? []} strategy={verticalListSortingStrategy}>
                                                  {orderedTopicos.map((topico) => (
                                                    <SortableNodeRow
                                                      key={topico.id}
                                                      id={topico.id}
                                                      label={topico.titulo}
                                                      icon={<FileText className="h-3.5 w-3.5" />}
                                                      isSelected={selectedId === topico.id && selectedType === "topico"}
                                                      hasChildren={false}
                                                      isExpanded={false}
                                                      publicado={topico.publicado}
                                                      indent={68}
                                                      onToggle={() => {}}
                                                      onSelect={() => select("topico", topico.id)}
                                                    />
                                                  ))}
                                                </SortableContext>

                                                {creating?.type === "topico" && creating.parentId === area.id && (
                                                  <InlineForm
                                                    action={criarTopicoContent.bind(null, area.id)}
                                                    onCancel={() => setCreating(null)}
                                                    placeholder="Nuevo tópico..."
                                                    fieldName="titulo"
                                                    indent={68}
                                                  />
                                                )}
                                              </>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </SortableContext>

                                    {creating?.type === "area" && creating.parentId === disc.id && (
                                      <InlineForm
                                        action={criarAreaContent.bind(null, disc.id)}
                                        onCancel={() => setCreating(null)}
                                        placeholder="Nueva unidad..."
                                        indent={52}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </SortableContext>

                        {creating?.type === "disciplina" && creating.parentId === curso.id && (
                          <InlineForm
                            action={criarDisciplinaContent.bind(null, curso.id)}
                            onCancel={() => setCreating(null)}
                            placeholder="Nueva materia..."
                            indent={36}
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </SortableContext>
          </DndContext>
        )}

        {/* New curso */}
        {creating?.type === "curso" ? (
          <InlineForm
            action={criarCursoContent}
            onCancel={() => setCreating(null)}
            placeholder="Nuevo curso..."
            indent={20}
          />
        ) : (
          <button
            type="button"
            onClick={() => startCreate("curso")}
            className="flex items-center gap-2 w-full rounded-md text-xs transition-opacity"
            style={{ paddingLeft: 16, paddingTop: 6, paddingBottom: 6, color: "var(--text-muted)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo curso
          </button>
        )}
      </div>
    </div>
  );
}
