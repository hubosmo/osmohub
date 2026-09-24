"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  criarCursoContent,
  criarDisciplinaContent,
  criarAreaContent,
  criarTopicoContent,
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

function getInitialExpanded(
  tree: TreeCurso[],
  selectedId?: string,
  selectedType?: string
): Set<string> {
  const expanded = new Set<string>();
  if (!selectedId || !selectedType) return expanded;

  for (const curso of tree) {
    if (selectedType === "curso" && curso.id === selectedId) {
      expanded.add(curso.id);
      return expanded;
    }
    for (const disc of curso.disciplinas) {
      if (selectedType === "disciplina" && disc.id === selectedId) {
        expanded.add(curso.id);
        expanded.add(disc.id);
        return expanded;
      }
      for (const area of disc.areas) {
        if (selectedType === "area" && area.id === selectedId) {
          expanded.add(curso.id);
          expanded.add(disc.id);
          expanded.add(area.id);
          return expanded;
        }
        for (const topico of area.topicos) {
          if (selectedType === "topico" && topico.id === selectedId) {
            expanded.add(curso.id);
            expanded.add(disc.id);
            expanded.add(area.id);
            return expanded;
          }
        }
      }
    }
  }
  return expanded;
}

type CreateMode = { type: "disciplina" | "area" | "topico" | "curso"; parentId?: string } | null;

function StatusDot({ publicado }: { publicado: boolean }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full shrink-0"
      style={{ backgroundColor: publicado ? "var(--success)" : "var(--warning)" }}
    />
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
        <input
          name={fieldName}
          required
          autoFocus
          placeholder={placeholder}
          className="flex-1 h-7 px-2 rounded text-xs outline-none"
          style={{
            backgroundColor: "var(--bg-base)",
            border: "1px solid var(--accent)",
            color: "var(--text-primary)",
          }}
        />
        <button
          type="submit"
          className="h-7 w-7 flex items-center justify-center rounded text-white shrink-0"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-7 w-7 flex items-center justify-center rounded shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
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
}

function NodeRow({
  id, label, icon, isSelected, hasChildren, isExpanded, publicado,
  indent, onToggle, onSelect, onAdd, addTitle,
}: NodeRowProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-md group cursor-pointer select-none"
      style={{
        paddingLeft: indent,
        paddingRight: 8,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: isSelected ? "var(--accent)1a" : undefined,
        borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
      }}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(); }}
        className="h-4 w-4 flex items-center justify-center shrink-0"
        style={{ color: "var(--text-muted)", visibility: hasChildren ? "visible" : "hidden" }}
      >
        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      <div
        className="flex-1 flex items-center gap-1.5 min-w-0"
        onClick={onSelect}
      >
        {icon && <span className="shrink-0" style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}>{icon}</span>}
        <span
          className="text-sm truncate"
          style={{ color: isSelected ? "var(--accent)" : "var(--text-secondary)", fontWeight: isSelected ? 600 : 400 }}
        >
          {label}
        </span>
        <StatusDot publicado={publicado} />
      </div>

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

export function ContentTree({ tree, selectedId, selectedType }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(
    () => getInitialExpanded(tree, selectedId, selectedType)
  );
  const [creating, setCreating] = useState<CreateMode>(null);
  const [search, setSearch] = useState("");

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const select = (type: string, id: string) => {
    router.push(`/admin/content?${type}=${id}`);
  };

  const startCreate = (type: NonNullable<CreateMode>["type"], parentId?: string) => {
    setCreating({ type: type as "disciplina" | "area" | "topico" | "curso", parentId });
    if (parentId) {
      setExpanded((prev) => new Set([...prev, parentId]));
    }
  };

  const q = search.toLowerCase();
  const filteredTree = q
    ? tree.map((curso) => ({
        ...curso,
        disciplinas: curso.disciplinas
          .map((disc) => ({
            ...disc,
            areas: disc.areas
              .map((area) => ({
                ...area,
                topicos: area.topicos.filter((t) => t.titulo.toLowerCase().includes(q)),
              }))
              .filter(
                (area) =>
                  area.nome.toLowerCase().includes(q) || area.topicos.length > 0
              ),
          }))
          .filter(
            (disc) =>
              disc.nome.toLowerCase().includes(q) || disc.areas.length > 0
          ),
      }))
      .filter((c) => c.nome.toLowerCase().includes(q) || c.disciplinas.length > 0)
    : tree;

  return (
    <div
      className="flex flex-col h-full border-r overflow-hidden"
      style={{
        width: 280,
        minWidth: 280,
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contenido..."
          className="w-full h-8 px-3 rounded-lg text-xs outline-none"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {filteredTree.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>
            {search ? "Sin resultados" : "Sin contenido aún"}
          </p>
        ) : (
          filteredTree.map((curso) => (
            <div key={curso.id}>
              <NodeRow
                id={curso.id}
                label={curso.nome}
                icon={curso.icone ? <span className="text-sm">{curso.icone}</span> : <BookOpen className="h-3.5 w-3.5" />}
                isSelected={selectedId === curso.id && selectedType === "curso"}
                hasChildren={curso.disciplinas.length > 0}
                isExpanded={expanded.has(curso.id)}
                publicado={curso.publicado}
                indent={8}
                onToggle={() => toggle(curso.id)}
                onSelect={() => select("curso", curso.id)}
                onAdd={() => startCreate("disciplina", curso.id)}
                addTitle="Nueva materia"
              />

              {expanded.has(curso.id) && (
                <>
                  {curso.disciplinas.map((disc) => (
                    <div key={disc.id}>
                      <NodeRow
                        id={disc.id}
                        label={disc.nome}
                        icon={disc.icone ? <span className="text-sm">{disc.icone}</span> : <Layers className="h-3.5 w-3.5" />}
                        isSelected={selectedId === disc.id && selectedType === "disciplina"}
                        hasChildren={disc.areas.length > 0}
                        isExpanded={expanded.has(disc.id)}
                        publicado={disc.publicado}
                        indent={24}
                        onToggle={() => toggle(disc.id)}
                        onSelect={() => select("disciplina", disc.id)}
                        onAdd={() => startCreate("area", disc.id)}
                        addTitle="Nueva unidad"
                      />

                      {expanded.has(disc.id) && (
                        <>
                          {disc.areas.map((area) => (
                            <div key={area.id}>
                              <NodeRow
                                id={area.id}
                                label={area.nome}
                                icon={<FolderOpen className="h-3.5 w-3.5" />}
                                isSelected={selectedId === area.id && selectedType === "area"}
                                hasChildren={area.topicos.length > 0}
                                isExpanded={expanded.has(area.id)}
                                publicado={area.publicado}
                                indent={40}
                                onToggle={() => toggle(area.id)}
                                onSelect={() => select("area", area.id)}
                                onAdd={() => startCreate("topico", area.id)}
                                addTitle="Nuevo tópico"
                              />

                              {expanded.has(area.id) && (
                                <>
                                  {area.topicos.map((topico) => (
                                    <NodeRow
                                      key={topico.id}
                                      id={topico.id}
                                      label={topico.titulo}
                                      icon={<FileText className="h-3.5 w-3.5" />}
                                      isSelected={selectedId === topico.id && selectedType === "topico"}
                                      hasChildren={false}
                                      isExpanded={false}
                                      publicado={topico.publicado}
                                      indent={56}
                                      onToggle={() => {}}
                                      onSelect={() => select("topico", topico.id)}
                                    />
                                  ))}

                                  {creating?.type === "topico" && creating.parentId === area.id && (
                                    <InlineForm
                                      action={criarTopicoContent.bind(null, area.id)}
                                      onCancel={() => setCreating(null)}
                                      placeholder="Nuevo tópico..."
                                      fieldName="titulo"
                                      indent={56}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          ))}

                          {creating?.type === "area" && creating.parentId === disc.id && (
                            <InlineForm
                              action={criarAreaContent.bind(null, disc.id)}
                              onCancel={() => setCreating(null)}
                              placeholder="Nueva unidad..."
                              indent={40}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))}

                  {creating?.type === "disciplina" && creating.parentId === curso.id && (
                    <InlineForm
                      action={criarDisciplinaContent.bind(null, curso.id)}
                      onCancel={() => setCreating(null)}
                      placeholder="Nueva materia..."
                      indent={24}
                    />
                  )}
                </>
              )}
            </div>
          ))
        )}

        {/* New curso */}
        {creating?.type === "curso" ? (
          <InlineForm
            action={criarCursoContent}
            onCancel={() => setCreating(null)}
            placeholder="Nuevo curso..."
            indent={8}
          />
        ) : (
          <button
            type="button"
            onClick={() => startCreate("curso")}
            className="flex items-center gap-2 w-full rounded-md text-xs transition-opacity"
            style={{ paddingLeft: 12, paddingTop: 6, paddingBottom: 6, color: "var(--text-muted)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo curso
          </button>
        )}
      </div>
    </div>
  );
}
